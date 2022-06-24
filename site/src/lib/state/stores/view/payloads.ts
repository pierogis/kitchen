import { get, writable, type Writable } from 'svelte/store';

import { v4 as uuid } from 'uuid';

import {
	Direction,
	FlavorType,
	type Flavor,
	type Payload,
	type PayloadParams,
	type Usage
} from '@types';
import type { RecipeState } from '@recipe';
import { ActionType, type Action } from '$lib/state/actions';

export type PayloadsState = {
	getPayload: (
		flavorUuid: string,
		usageUuid: string,
		direction: Direction
	) => Writable<Payload<FlavorType>> & {
		monitor: boolean;
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
		}
	> = new Map();

	const flavorUsagePayloads = {
		clear: flavorUsagePayloadsMap.clear,
		get: (flavorUuid: string, usageUuid: string, direction: Direction) =>
			flavorUsagePayloadsMap.get([flavorUuid, usageUuid, direction].join(',')),
		set: (
			flavorUuid: string,
			usageUuid: string,
			direction: Direction,
			payload: Writable<Payload<FlavorType>> & {
				monitor: boolean;
			}
		) => flavorUsagePayloadsMap.set([flavorUuid, usageUuid, direction].join(','), payload)
	};

	recipeState.callsFor.subscribe((currentCallsFor) => {
		flavorUsagePayloads.clear();
		// each flavor should have a payload
		const currentParameters = Array.from(get(recipeState.parameters).values());
		const currentConnections = Array.from(get(recipeState.connections).values());
		const currentFlavors = Array.from(get(recipeState.flavors).values());
		const currentUsages = get(recipeState.usages);

		function addPayload(flavor: Flavor, usage: Usage) {
			// add flavor to map with params/default
			const parameter = currentParameters.find(
				(parameter) => parameter.flavorUuid == flavor.uuid && parameter.usageUuid == usage.uuid
			);

			const payload: Payload<FlavorType> = parameter?.payload || {
				type: flavor.type,
				params: paramsDefaults[flavor.type]
			};

			const inPayload: Writable<Payload<FlavorType>> = writable(payload);
			const outPayload: Writable<Payload<FlavorType>> = writable(payload);

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

			let fired = false;
			inPayload.subscribe((newPayload) => {
				if (fired && !inMonitor) {
					if (!parameter) {
						const createParameterAction: Action<ActionType.CreateParameter> = {
							type: ActionType.CreateParameter,
							params: {
								parameter: {
									uuid: uuid(),
									payload: newPayload,
									recipeUuid: get(recipeState.recipeUuid),
									flavorUuid: flavor.uuid,
									usageUuid: usage.uuid
								}
							}
						};
						recipeState.dispatch(createParameterAction);
					} else {
						const updateParameterAction: Action<ActionType.UpdateParameter> = {
							type: ActionType.UpdateParameter,
							params: {
								parameter: {
									...parameter,
									payload: newPayload
								}
							}
						};
						recipeState.dispatch(updateParameterAction);
					}
				}

				fired = true;
			});

			flavorUsagePayloads.set(flavor.uuid, usage.uuid, Direction.In, {
				...inPayload,
				monitor: inMonitor
			});

			flavorUsagePayloads.set(flavor.uuid, usage.uuid, Direction.Out, {
				...outPayload,
				monitor: outMonitor
			});
		}

		// if a entry does not exist for every flavor in current flavors, add
		for (const callFor of currentCallsFor.values()) {
			const usage = currentUsages.get(callFor.usageUuid);
			if (!usage) throw `usage ${callFor.usageUuid} not found`;

			for (const flavor of currentFlavors.values()) {
				if (flavor.ingredientUuid == usage.ingredientUuid) {
					addPayload(flavor, usage);
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

		payload.set(newPayload);
	}

	return {
		getPayload,
		setPayload
	};
}
