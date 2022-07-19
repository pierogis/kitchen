import { get } from 'svelte/store';

import type * as THREE from 'three';

import type { FlatRecipe } from '@recipe';
import type { ViewState } from '@view';
import {
	FlavorType,
	Direction,
	type Payload,
	type Prep,
	PrepType,
	type FlavorUuidMap
} from '@types';
import { prepPrimitives, type InPayloads } from '../preps';
import { valueDefaults } from '$lib/state/stores/view/fillings';

const knownPayloadsMap: Map<string, Payload<FlavorType>> = new Map();
const visiting: Set<string> = new Set();
const knownPayloads = {
	clear: () => {
		knownPayloadsMap.clear();
		visiting.clear();
	},
	getVisited: (flavorUuid: string, usageUuid: string, direction: Direction) =>
		knownPayloadsMap.get([flavorUuid, usageUuid, direction].join(',')),
	setVisited: (
		flavorUuid: string,
		usageUuid: string,
		direction: Direction,
		payload: Payload<FlavorType>
	) => knownPayloadsMap.set([flavorUuid, usageUuid, direction].join(','), payload),
	setVisiting: (flavorUuid: string, usageUuid: string, direction: Direction) =>
		visiting.add([flavorUuid, usageUuid, direction].join(',')),
	isVisiting: (flavorUuid: string, usageUuid: string, direction: Direction) =>
		visiting.has([flavorUuid, usageUuid, direction].join(',')),
	removeVisiting: (flavorUuid: string, usageUuid: string, direction: Direction) =>
		visiting.delete([flavorUuid, usageUuid, direction].join(','))
};

export function cook(
	renderer: THREE.WebGLRenderer,
	scene: THREE.Scene,
	camera: THREE.Camera,
	context: CanvasRenderingContext2D,
	recipe: FlatRecipe,
	viewState: ViewState
) {
	// this will go through the flavor usages in focus (and the docked flavors)
	// and calculate a payload based on that flavor usage's in payload and shaders, expressions, etc.
	// it will set these new out fillings on the view state

	knownPayloads.clear();
	scene.clear();

	const currentParameters = Array.from(recipe.parameters.values());

	function cookFlavor(
		flavorUuid: string,
		usageUuid: string,
		direction: Direction
	): Payload<FlavorType> {
		// memoize
		let payload = knownPayloads.getVisited(flavorUuid, usageUuid, direction);
		if (payload) return payload;

		if (knownPayloads.isVisiting(flavorUuid, usageUuid, direction)) {
			throw 'cycle detected';
		}
		knownPayloads.setVisiting(flavorUuid, usageUuid, direction);

		const flavor = recipe.flavors.get(flavorUuid);
		if (!flavor) throw `flavor ${flavorUuid} not found`;

		const prep = flavor.prepUuid && recipe.preps.get(flavor.prepUuid);
		if (direction == Direction.Out && prep) {
			// cook prep if part of a prep
			cookPrep(prep, usageUuid);
			payload = knownPayloads.getVisited(flavorUuid, usageUuid, direction);
			if (!payload) throw `prep payload for flavor ${flavorUuid} on usage ${usageUuid} not found`;
		} else {
			const flavorInConnection = Array.from(recipe.connections.values()).find(
				(connection) => connection.inFlavorUuid == flavor.uuid
			);

			if (flavorInConnection) {
				const outFlavor = recipe.flavors.get(flavorInConnection.outFlavorUuid);
				if (!outFlavor) throw `out flavor ${flavorInConnection.outFlavorUuid} not found`;
				const usage = recipe.usages.get(usageUuid);
				if (!usage) throw `usage ${usageUuid} not found`;

				// if there is no out usage, this connection goes to a parentIngredient in(!) flavor
				const outFlavorTrueDirection =
					flavorInConnection.outUsageUuid || outFlavor.prepUuid ? Direction.Out : Direction.In;

				// a connection may not include a usage uuid to indicate that the flavor's usage is the usage that owns this connection
				// still need to determine what usage this should refer to
				let outUsageUuid = flavorInConnection.outUsageUuid;
				if (!outUsageUuid) {
					if (flavor.ingredientUuid == flavorInConnection.parentIngredientUuid) {
						outUsageUuid = usageUuid;
					} else {
						outUsageUuid = usage.parentUsageUuid;
						if (!outUsageUuid) {
							// fall back on main usage
							const mainCallFor = recipe.callsFor.get(recipe.mainCallForUuid);
							if (!mainCallFor) throw `main callFor ${recipe.mainCallForUuid} not found`;

							outUsageUuid = mainCallFor.usageUuid;
						}
					}
				}

				payload = cookFlavor(
					flavorInConnection.outFlavorUuid,
					outUsageUuid,
					outFlavorTrueDirection
				);
			}

			if (!payload) {
				// fall back on param/default stored in fillings
				const parameter = currentParameters.find(
					(parameter) => parameter.flavorUuid == flavor.uuid && parameter.usageUuid == usageUuid
				);

				payload = parameter?.payload || {
					type: flavor.type,
					value: valueDefaults[flavor.type]
				};
			}
		}

		if (!payload) throw `could not cook flavor ${flavorUuid}`;

		knownPayloads.removeVisiting(flavorUuid, usageUuid, direction);
		knownPayloads.setVisited(flavorUuid, usageUuid, direction, payload);
		viewState.fillings.setPayload(flavorUuid, usageUuid, direction, payload);

		return payload;
	}

	function cookPrep<P extends PrepType>(prep: Prep<P>, usageUuid: string) {
		const inPayloads: { [prepFlavorName: string]: Payload<FlavorType> } = {};
		// cook in side of preps (copy from parameters/input)
		for (const [prepFlavorName, flavorUuid] of Object.entries(prep.inFlavorUuidMap)) {
			const payload = cookFlavor(flavorUuid, usageUuid, Direction.In);
			inPayloads[prepFlavorName] = payload;
		}

		const outPayloads = prepPrimitives[prep.type].cook(scene, camera, inPayloads as InPayloads<P>);

		for (const [prepFlavorName, payload] of Object.entries(outPayloads)) {
			const flavorUuid =
				prep.outFlavorUuidMap[prepFlavorName as keyof FlavorUuidMap<P, Direction.Out>];
			if (typeof flavorUuid != 'string')
				throw `${prepFlavorName} not found in prep ${prep.uuid} flavorUuidMap`;

			knownPayloads.removeVisiting(flavorUuid, usageUuid, Direction.Out);
			knownPayloads.setVisited(flavorUuid, usageUuid, Direction.Out, payload);
			viewState.fillings.setPayload(flavorUuid, usageUuid, Direction.Out, payload);
		}
	}

	function cookUsage(usageUuid: string) {
		// work through the flavors on this usage's ingredient
		const usage = recipe.usages.get(usageUuid);
		if (!usage) throw `usage ${usageUuid} not found`;

		for (const prep of recipe.preps.values()) {
			if (prep.ingredientUuid == usage.ingredientUuid) {
				cookPrep(prep, usageUuid);
			}
		}

		for (const flavor of recipe.flavors.values()) {
			if (flavor.ingredientUuid == usage.ingredientUuid) {
				if (flavor.directions.includes(Direction.In)) {
					let payload = knownPayloads.getVisited(flavor.uuid, usageUuid, Direction.In);

					if (!payload) {
						payload = cookFlavor(flavor.uuid, usageUuid, Direction.In);
					}
				}
				if (flavor.directions.includes(Direction.Out)) {
					let payload = knownPayloads.getVisited(flavor.uuid, usageUuid, Direction.Out);
					if (!payload) {
						payload = cookFlavor(flavor.uuid, usageUuid, Direction.Out);
					}
				}
			}
		}
	}

	// // function works from perspective of main ingredient/usage
	cookUsage(recipe.focusedUsageUuid);

	for (const node of get(viewState.nodes)) {
		cookUsage(node.callFor.usageUuid);
	}

	renderer.render(scene, camera);

	context.drawImage(renderer.domElement, 0, 0);
}
