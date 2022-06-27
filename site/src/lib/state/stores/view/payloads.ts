import { get, writable, type Writable } from 'svelte/store';

import {
	Direction,
	FlavorType,
	type Flavor,
	type Payload,
	type PayloadParams,
	type Usage
} from '@types';
import type { RecipeState } from '@recipe';

export type PayloadsState = {
	getPayload: (
		flavorUuid: string,
		usageUuid: string,
		direction: Direction
	) => Writable<Payload<FlavorType>> & {
		monitor: boolean;
		parameterUuid?: string;
	};
	setPayload: (
		flavorUuid: string,
		usageUuid: string,
		direction: Direction,
		newPayload: Payload<FlavorType>
	) => void;
};

export function createPayloads(recipeState: RecipeState): PayloadsState {
	const paramsDefaults: {
		[flavorType in FlavorType]: PayloadParams<flavorType>;
	} = {
		[FlavorType.Color]: '#0088ff',
		[FlavorType.Image]: '',
		[FlavorType.Number]: 0,
		[FlavorType.Text]: ''
	};

	const flavorUsagePayloadsMap: Map<
		string,
		Writable<Payload<FlavorType>> & {
			monitor: boolean;
			parameterUuid?: string;
		}
	> = new Map();

	const flavorUsagePayloads = {
		clear: () => flavorUsagePayloadsMap.clear(),
		has: (flavorUuid: string, usageUuid: string, direction: Direction) =>
			flavorUsagePayloadsMap.has([flavorUuid, usageUuid, direction].join(',')),
		get: (flavorUuid: string, usageUuid: string, direction: Direction) =>
			flavorUsagePayloadsMap.get([flavorUuid, usageUuid, direction].join(',')),
		set: (
			flavorUuid: string,
			usageUuid: string,
			direction: Direction,
			payload: Writable<Payload<FlavorType>> & {
				monitor: boolean;
				parameterUuid?: string;
			}
		) => flavorUsagePayloadsMap.set([flavorUuid, usageUuid, direction].join(','), payload)
	};

	recipeState.callsFor.subscribe((currentCallsFor) => {
		// each flavor should have a payload
		const currentParameters = Array.from(get(recipeState.parameters).values());
		const currentConnections = Array.from(get(recipeState.connections).values());
		const currentFlavors = Array.from(get(recipeState.flavors).values());
		const currentUsages = get(recipeState.usages);

		// if a entry does not exist for every flavor in current flavors, add
		for (const callFor of currentCallsFor.values()) {
			const usage = currentUsages.get(callFor.usageUuid);
			if (!usage) throw `usage ${callFor.usageUuid} not found`;

			for (const flavor of currentFlavors.values()) {
				if (flavor.ingredientUuid == usage.ingredientUuid) {
					// add flavor to map with params/default
					const parameter = currentParameters.find(
						(parameter) => parameter.flavorUuid == flavor.uuid && parameter.usageUuid == usage.uuid
					);

					const payload: Payload<FlavorType> = parameter?.payload || {
						type: flavor.type,
						params: paramsDefaults[flavor.type]
					};
					const inMonitor = currentConnections.some(
						(connection) =>
							connection.inFlavorUuid == flavor.uuid &&
							connection.inUsageUuid == usage.uuid &&
							connection.parentIngredientUuid != usage.ingredientUuid
					);

					const outMonitor = currentConnections.some(
						(connection) =>
							connection.inFlavorUuid == flavor.uuid &&
							connection.inUsageUuid == usage.uuid &&
							connection.parentIngredientUuid == usage.ingredientUuid
					);

					let inPayload: Writable<Payload<FlavorType>> | undefined = flavorUsagePayloads.get(
						flavor.uuid,
						usage.uuid,
						Direction.In
					);
					let outPayload: Writable<Payload<FlavorType>> | undefined = flavorUsagePayloads.get(
						flavor.uuid,
						usage.uuid,
						Direction.Out
					);

					if (!inPayload) {
						inPayload = writable(payload);
					} else {
						setPayload(flavor.uuid, usage.uuid, Direction.In, payload);
					}
					if (!outPayload) {
						outPayload = writable(payload);
					} else {
						setPayload(flavor.uuid, usage.uuid, Direction.Out, payload);
					}

					// add or update payload
					flavorUsagePayloads.set(flavor.uuid, usage.uuid, Direction.In, {
						...inPayload,
						monitor: inMonitor,
						parameterUuid: parameter?.uuid
					});

					flavorUsagePayloads.set(flavor.uuid, usage.uuid, Direction.Out, {
						...outPayload,
						monitor: outMonitor,
						parameterUuid: parameter?.uuid
					});
				}
			}
		}
	});

	function getPayload(flavorUuid: string, usageUuid: string, direction: Direction) {
		const payload = flavorUsagePayloads.get(flavorUuid, usageUuid, direction);
		if (!payload) throw `payload for flavor ${flavorUuid} on usage ${usageUuid} not found`;

		return payload;
	}

	function setPayload(
		flavorUuid: string,
		usageUuid: string,
		direction: Direction,
		newPayload: Payload<FlavorType>
	) {
		const payload = flavorUsagePayloads.get(flavorUuid, usageUuid, direction);
		if (!payload) throw `payload for flavor ${flavorUuid} on usage ${usageUuid} not found`;

		const params = get(payload).params;

		if (params != newPayload.params) {
			payload.set(newPayload);
		}
	}

	return {
		getPayload,
		setPayload
	};
}
