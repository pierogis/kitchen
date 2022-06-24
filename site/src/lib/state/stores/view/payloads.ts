import { get, writable, type Writable } from 'svelte/store';

import { v4 as uuid } from 'uuid';

import { FlavorType, type Flavor, type Payload, type PayloadParams, type Usage } from '@types';
import type { RecipeState } from '@recipe';
import { ActionType, type Action } from '$lib/state/actions';

export type PayloadsState = {
	getPayload: (
		flavorUuid: string,
		usageUuid: string
	) => Writable<Payload<FlavorType>> & {
		monitor: boolean;
	};
	setPayload: (flavorUuid: string, usageUuid: string, newPayload: Payload<FlavorType>) => void;
};

function getPayloadsKey(flavorUuid: string, usageUuid: string): string {
	return `${flavorUuid}, ${usageUuid}`;
}

export function createPayloads(recipeState: RecipeState): PayloadsState {
	const paramsDefaults: {
		[flavorType in FlavorType]: PayloadParams<flavorType>;
	} = {
		[FlavorType.Color]: '#0088ff',
		[FlavorType.Image]: '',
		[FlavorType.Number]: 0,
		[FlavorType.Text]: ''
	};

	const flavorUsagePayloads: Map<
		string,
		Writable<Payload<FlavorType>> & {
			monitor: boolean;
		}
	> = new Map();

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

			const payload: Writable<Payload<FlavorType>> = writable(
				parameter?.payload || {
					type: flavor.type,
					params: paramsDefaults[flavor.type]
				}
			);
			const monitor = currentConnections.some(
				(connection) =>
					connection.inFlavorUuid == flavor.uuid && connection.inUsageUuid == usage.uuid
			);

			let fired = false;
			payload.subscribe((newPayload) => {
				if (fired && !monitor) {
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

			flavorUsagePayloads.set(getPayloadsKey(flavor.uuid, usage.uuid), { ...payload, monitor });
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

	function getPayload(flavorUuid: string, usageUuid: string) {
		const payload = flavorUsagePayloads.get(getPayloadsKey(flavorUuid, usageUuid));
		if (!payload) throw `payload for flavor ${flavorUuid} on usage ${usageUuid} not found`;

		return payload;
	}

	function setPayload(flavorUuid: string, usageUuid: string, newPayload: Payload<FlavorType>) {
		const payload = flavorUsagePayloads.get(getPayloadsKey(flavorUuid, usageUuid));
		if (!payload) throw `payload for flavor ${flavorUuid} on usage ${usageUuid} not found`;
		payload.set(newPayload);
	}

	return {
		getPayload,
		setPayload
	};
}
