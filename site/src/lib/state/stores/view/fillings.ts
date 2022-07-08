import { derived, get, writable, type Writable } from 'svelte/store';

import { Direction, FlavorType, type Payload, type PayloadValue } from '@types';
import type { RecipeState } from '@recipe';
import { prepPrimitives } from '$lib/common/preps';

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

export interface Filling {
	payload: Writable<Payload<FlavorType>>;
	monitorStatus: Writable<{
		monitor: boolean;
		parameterUuid?: string;
	}>;
}

export function createFillings(recipeState: RecipeState): FillingsState {
	const valueDefaults: {
		[flavorType in FlavorType]: PayloadValue<flavorType>;
	} = {
		[FlavorType.Color]: '#0088ff',
		[FlavorType.Image]: '',
		[FlavorType.Number]: 0,
		[FlavorType.Text]: ''
	};

	const flavorUsageFillingsMap: Map<string, Filling> = new Map();

	const flavorUsageFillings = {
		clear: () => flavorUsageFillingsMap.clear(),
		has: (flavorUuid: string, usageUuid: string, direction: Direction) =>
			flavorUsageFillingsMap.has([flavorUuid, usageUuid, direction].join(',')),
		get: (flavorUuid: string, usageUuid: string, direction: Direction) =>
			flavorUsageFillingsMap.get([flavorUuid, usageUuid, direction].join(',')),
		set: (flavorUuid: string, usageUuid: string, direction: Direction, filling: Filling) =>
			flavorUsageFillingsMap.set([flavorUuid, usageUuid, direction].join(','), filling)
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
						let filling: Filling | undefined = flavorUsageFillings.get(
							flavor.uuid,
							usage.uuid,
							direction
						);

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

							flavorUsageFillings.set(flavor.uuid, usage.uuid, direction, filling);
						} else {
							setMonitorStatus(flavor.uuid, usage.uuid, direction, monitorStatus);
							setPayload(flavor.uuid, usage.uuid, direction, payload);
						}
					}
				}
			}
		}
	});

	function getFilling(flavorUuid: string, usageUuid: string, direction: Direction) {
		const filling = flavorUsageFillings.get(flavorUuid, usageUuid, direction);
		if (!filling) throw `filling for flavor ${flavorUuid} on usage ${usageUuid} not found`;

		return filling;
	}

	function setPayload(
		flavorUuid: string,
		usageUuid: string,
		direction: Direction,
		newPayload: Payload<FlavorType>
	) {
		const filling = flavorUsageFillings.get(flavorUuid, usageUuid, direction);
		if (!filling) throw `filling for flavor ${flavorUuid} on usage ${usageUuid} not found`;

		const value = get(filling.payload).value;

		if (value != newPayload.value) {
			filling.payload.set(newPayload);
		}
	}

	function setMonitorStatus(
		flavorUuid: string,
		usageUuid: string,
		direction: Direction,
		newMonitorStatus: { monitor: boolean; parameterUuid?: string }
	) {
		const filling = flavorUsageFillings.get(flavorUuid, usageUuid, direction);
		if (!filling) throw `filling for flavor ${flavorUuid} on usage ${usageUuid} not found`;

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