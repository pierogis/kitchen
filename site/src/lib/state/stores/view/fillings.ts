import { get, writable, type Writable } from 'svelte/store';

import * as THREE from 'three';

import { Direction, FlavorType, type Payload, type PayloadValue } from '@types';
import type { RecipeState } from '@recipe';

export interface Filling {
	payload: Writable<Payload<FlavorType>>;
	monitorStatus: Writable<{
		monitor: boolean;
		parameterUuid?: string;
	}>;
}

export type FillingsState = {
	getFilling: (flavorUuid: string, usageUuid: string) => Filling;

	setPayload: (
		flavorUuid: string,
		usageUuid: string,

		newPayload: Payload<FlavorType>
	) => void;

	setMonitorStatus: (
		flavorUuid: string,
		usageUuid: string,

		newMonitorStatus: {
			monitor: boolean;
			parameterUuid?: string;
		}
	) => void;
};

export function createFillings(recipeState: RecipeState): FillingsState {
	const valueDefaults: {
		[flavorType in FlavorType]: PayloadValue<flavorType>;
	} = {
		[FlavorType.Color]: '#0088ff',
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
		[FlavorType.Texture]: new THREE.Texture()
	};

	const flavorUsageFillingsMap: Map<string, Filling> = new Map();

	const flavorUsageFillings = {
		clear: () => flavorUsageFillingsMap.clear(),
		has: (flavorUuid: string, usageUuid: string) =>
			flavorUsageFillingsMap.has([flavorUuid, usageUuid].join(',')),
		get: (flavorUuid: string, usageUuid: string) =>
			flavorUsageFillingsMap.get([flavorUuid, usageUuid].join(',')),
		set: (flavorUuid: string, usageUuid: string, filling: Filling) =>
			flavorUsageFillingsMap.set([flavorUuid, usageUuid].join(','), filling)
	};

	recipeState.subscribe(($recipe) => {
		// each flavor on each usage should have a payload

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
						let filling: Filling | undefined = flavorUsageFillings.get(flavor.uuid, usage.uuid);

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

						if (!filling) {
							filling = {
								payload: writable(payload),
								monitorStatus: writable(monitorStatus)
							};

							flavorUsageFillings.set(flavor.uuid, usage.uuid, filling);
						} else {
							setMonitorStatus(flavor.uuid, usage.uuid, monitorStatus);
							setPayload(flavor.uuid, usage.uuid, payload);
						}
					}
				}
			}
		}
	});

	function getFilling(flavorUuid: string, usageUuid: string) {
		const filling = flavorUsageFillings.get(flavorUuid, usageUuid);
		if (!filling) throw `filling for flavor ${flavorUuid} on usage ${usageUuid} not found`;

		return filling;
	}

	function setPayload(
		flavorUuid: string,
		usageUuid: string,

		newPayload: Payload<FlavorType>
	) {
		const filling = getFilling(flavorUuid, usageUuid);

		const value = get(filling.payload).value;

		if (value != newPayload.value) {
			filling.payload.set(newPayload);
		}
	}

	function setMonitorStatus(
		flavorUuid: string,
		usageUuid: string,

		newMonitorStatus: { monitor: boolean; parameterUuid?: string }
	) {
		const filling = getFilling(flavorUuid, usageUuid);

		const monitorStatus = get(filling.monitorStatus);
		const monitor = monitorStatus.monitor;
		const parameterUuid = monitorStatus.parameterUuid;

		if (monitor != newMonitorStatus.monitor || parameterUuid != newMonitorStatus.parameterUuid) {
			filling.monitorStatus.set(newMonitorStatus);
		}
	}

	return {
		getFilling,
		setPayload,
		setMonitorStatus
	};
}
