import { writable, type Writable } from 'svelte/store';

import * as THREE from 'three';

import { Direction, FlavorType, type Payload, type PayloadValue } from '@types';
import type { RecipeState } from '@recipe';

export interface Filling {
	payload: Writable<Payload<FlavorType>>;
	camera: Writable<THREE.Camera>;
	monitorStatus: Writable<{
		monitor: boolean;
		parameterUuid?: string;
	}>;
}

export const valueDefaults: {
	[flavorType in FlavorType]: PayloadValue<flavorType>;
} = {
	[FlavorType.Color]: '#ffffff',
	[FlavorType.Image]: '',
	[FlavorType.Number]: 0,
	[FlavorType.Text]: '',
	[FlavorType.Geometry]: new THREE.BufferGeometry(),
	[FlavorType.Shader]: {
		uniforms: {},
		vertexShader: '',
		fragmentShader: ''
	},
	[FlavorType.Object]: new THREE.Object3D(),
	[FlavorType.Material]: new THREE.MeshBasicMaterial(),
	[FlavorType.Texture]: new THREE.Texture()
};

export type FillingsState = {
	getFilling: (flavorUuid: string, usageUuid: string, direction: Direction) => Filling;
	setPayload: (
		flavorUuid: string,
		usageUuid: string,
		direction: Direction,
		newPayload: Payload<FlavorType>
	) => void;
	setMonitorStatus: (
		flavorUuid: string,
		usageUuid: string,
		direction: Direction,
		newMonitorStatus: {
			monitor: boolean;
			parameterUuid?: string;
		}
	) => void;
};

export function createFillings(recipeState: RecipeState): FillingsState {
	const flavorUsageFillingsMap: Map<string, Filling> = new Map();

	const flavorUsageFillings = {
		clear: () => flavorUsageFillingsMap.clear(),
		has: (flavorUuid: string, usageUuid: string, direction: Direction) =>
			flavorUsageFillingsMap.has([flavorUuid, usageUuid, direction].join(',')),
		get: (flavorUuid: string, usageUuid: string, direction: Direction) =>
			flavorUsageFillingsMap.get([flavorUuid, usageUuid, direction].join(',')),
		set: (flavorUuid: string, usageUuid: string, direction: Direction, filling: Filling) =>
			flavorUsageFillingsMap.set([flavorUuid, usageUuid, direction].join(','), filling),
		delete: (flavorUuid: string, usageUuid: string, direction: Direction) =>
			flavorUsageFillingsMap.delete([flavorUuid, usageUuid, direction].join(','))
	};

	recipeState.subscribe(($recipe) => {
		// each flavor on each usage should have a payload

		const usedKeys = new Set<string>();

		const currentCallsFor = $recipe.callsFor;
		const currentParameters = Array.from($recipe.parameters.values());
		const currentConnections = Array.from($recipe.connections.values());
		const currentFlavors = Array.from($recipe.flavors.values());
		const currentUsages = $recipe.usages;

		// if a entry does not exist for every flavor in current flavors, add
		for (const callFor of currentCallsFor.values()) {
			const usage = currentUsages.get(callFor.usageUuid);
			if (!usage) throw `usage ${callFor.usageUuid} not found`;

			for (const flavor of currentFlavors.values()) {
				if (flavor.ingredientUuid == usage.ingredientUuid) {
					// add flavor to map with param/default
					const parameter = currentParameters.find(
						(parameter) => parameter.flavorUuid == flavor.uuid && parameter.usageUuid == usage.uuid
					);

					const payload: Payload<FlavorType> = parameter?.payload || {
						type: flavor.type,
						value: valueDefaults[flavor.type]
					};
					const prep = flavor.prepUuid ? $recipe.preps.get(flavor.prepUuid) : undefined;

					for (const direction of flavor.directions) {
						let filling: Filling | undefined = flavorUsageFillings.get(
							flavor.uuid,
							usage.uuid,
							direction
						);

						if (!filling) {
							const monitor =
								direction == Direction.In
									? currentConnections.some((connection) => {
											const flavorHasInConnection = connection.inFlavorUuid == flavor.uuid;

											// if the flavor is on connection's parentIngredient,
											// connection leading into it would have no usageUuid
											const flavorIsOnConnectionsParentIngredient =
												flavor.ingredientUuid == connection.parentIngredientUuid;

											const usageUuid = flavorIsOnConnectionsParentIngredient
												? undefined
												: usage.uuid;

											const connectionIsToFlavorsUsage = connection.inUsageUuid == usageUuid;

											return flavorHasInConnection && connectionIsToFlavorsUsage;
									  })
									: prep !== undefined;

							const monitorStatus = { monitor: monitor, parameterUuid: parameter?.uuid };

							const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
							camera.position.z = 2;

							filling = {
								payload: writable(payload),
								camera: writable(camera),
								monitorStatus: writable(monitorStatus)
							};

							flavorUsageFillings.set(flavor.uuid, usage.uuid, direction, filling);
						}
						usedKeys.add([flavor.uuid, usage.uuid, direction].join(','));
					}
				}
			}
		}

		for (const [key] of flavorUsageFillingsMap) {
			if (!usedKeys.has(key)) {
				flavorUsageFillingsMap.delete(key);
			}
		}
	});

	function getFilling(flavorUuid: string, usageUuid: string, direction: Direction) {
		const filling = flavorUsageFillings.get(flavorUuid, usageUuid, direction);
		if (!filling)
			throw `filling for ${direction} flavor ${flavorUuid} on usage ${usageUuid} not found`;

		return filling;
	}

	function setPayload(
		flavorUuid: string,
		usageUuid: string,
		direction: Direction,
		newPayload: Payload<FlavorType>
	) {
		const filling = getFilling(flavorUuid, usageUuid, direction);

		filling.payload.set(newPayload);
	}

	function setMonitorStatus(
		flavorUuid: string,
		usageUuid: string,
		direction: Direction,
		newMonitorStatus: { monitor: boolean; parameterUuid?: string }
	) {
		const filling = getFilling(flavorUuid, usageUuid, direction);

		filling.monitorStatus.set(newMonitorStatus);
	}

	return {
		getFilling,
		setPayload,
		setMonitorStatus
	};
}
