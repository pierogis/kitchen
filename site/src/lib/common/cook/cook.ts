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

const knownPayloadsMap: Map<string, Payload<FlavorType>> = new Map();
const knownPayloads = {
	clear: () => knownPayloadsMap.clear(),
	get: (flavorUuid: string, usageUuid: string) =>
		knownPayloadsMap.get([flavorUuid, usageUuid].join(',')),
	set: (flavorUuid: string, usageUuid: string, payload: Payload<FlavorType>) =>
		knownPayloadsMap.set([flavorUuid, usageUuid].join(','), payload)
};

export function cook(
	renderer: THREE.WebGLRenderer,
	scene: THREE.Scene,
	camera: THREE.Camera,
	recipe: FlatRecipe,
	viewState: ViewState
) {
	// this will go through the flavor usages in focus (and the docked flavors)
	// and calculate a payload based on that flavor usage's in payload and shaders, expressions, etc.
	// it will set these new out fillings on the view state

	knownPayloads.clear();

	function cookFlavor(
		flavorUuid: string,
		usageUuid: string,
		direction: Direction
	): Payload<FlavorType> {
		// memoize
		let payload = knownPayloads.get(flavorUuid, usageUuid);
		if (payload) return payload;

		const flavor = recipe.flavors.get(flavorUuid);
		if (!flavor) throw `flavor ${flavorUuid} not found`;

		const prep = flavor.prepUuid && recipe.preps.get(flavor.prepUuid);
		if (direction == Direction.Out && prep) {
			// cook prep if part of a prep
			cookPrep(prep, usageUuid);
			payload = knownPayloads.get(flavorUuid, usageUuid);
			if (!payload) throw `prep payload for flavor ${flavorUuid} on usage ${usageUuid} not found`;
		} else {
			const flavorInConnection = Array.from(recipe.connections.values()).find((connection) => {
				const sameFlavor = connection.inFlavorUuid == flavor.uuid;
				const isInOwnIngredient = connection.parentIngredientUuid == flavor.ingredientUuid;
				return sameFlavor && isInOwnIngredient;
			});

			if (flavorInConnection) {
				// if there is no out usage, this connection goes to a parentIngredient in(!) flavor
				const outFlavorTrueDirection =
					flavorInConnection.outUsageUuid && !flavor.prepUuid ? Direction.Out : Direction.In;

				payload = cookFlavor(
					flavorInConnection.outFlavorUuid,
					flavorInConnection.outUsageUuid || usageUuid,
					outFlavorTrueDirection
				);
			}

			if (!payload) {
				// fall back on param/default stored in fillings
				payload = get(viewState.fillings.getFilling(flavorUuid, usageUuid).payload);
				if (!payload)
					throw `default/parameter payload for flavor ${flavorUuid} on usage ${usageUuid} not found`;
			}
		}

		if (!payload) throw `could not cook flavor ${flavorUuid}`;

		return payload;
	}

	function cookPrep<P extends PrepType>(prep: Prep<P>, usageUuid: string) {
		const inPayloads: { [prepFlavorName: string]: Payload<FlavorType> } = {};
		// cook in side of preps (copy from parameters/input)
		for (const [prepFlavorName, flavorUuid] of Object.entries(prep.inFlavorUuidMap)) {
			const flavor = recipe.flavors.get(flavorUuid);

			if (flavor?.directions.includes(Direction.In)) {
				// why does this keep looping on connect
				const payload = cookFlavor(flavorUuid, usageUuid, Direction.In);
				inPayloads[prepFlavorName] = payload;
			}
		}

		const outPayloads = prepPrimitives[prep.type].cook(scene, camera, inPayloads as InPayloads<P>);

		for (const [prepFlavorName, payload] of Object.entries(outPayloads)) {
			const flavorUuid =
				prep.outFlavorUuidMap[prepFlavorName as keyof FlavorUuidMap<P, Direction.Out>];
			if (typeof flavorUuid != 'string')
				throw `${prepFlavorName} not found in prep ${prep.uuid} flavorUuidMap`;

			knownPayloads.set(flavorUuid, usageUuid, payload);
			viewState.fillings.setPayload(flavorUuid, usageUuid, payload);
		}
	}

	function cookUsage(usageUuid: string) {
		// work through the flavors on this usage's ingredient
		const usage = recipe.usages.get(usageUuid);
		if (!usage) throw `usage ${usageUuid} not found`;

		for (const flavor of recipe.flavors.values()) {
			if (flavor.ingredientUuid == usage.ingredientUuid) {
				let payload: Payload<FlavorType>;

				if (flavor.directions.includes(Direction.Out)) {
					payload = cookFlavor(flavor.uuid, usageUuid, Direction.Out);
				} else {
					payload = cookFlavor(flavor.uuid, usageUuid, Direction.In);
				}

				knownPayloads.set(flavor.uuid, usageUuid, payload);
				viewState.fillings.setPayload(flavor.uuid, usageUuid, payload);
			}
		}
	}

	// function works from perspective of main ingredient/usage
	cookUsage(recipe.focusedUsageUuid);

	for (const node of get(viewState.nodes)) {
		cookUsage(node.callFor.usageUuid);
	}

	renderer.render(scene, camera);
}
