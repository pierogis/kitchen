import { get, writable, type Writable } from 'svelte/store';

import { v4 as uuid } from 'uuid';

import { FlavorType, type CallFor, type Flavor, type Payload, type PayloadParams } from '@types';
import type { RecipeState } from '@recipe';
import { ActionType, type Action } from '$lib/state/actions';

export type PayloadsState = {
	getPayload: (
		flavorUuid: string,
		usageUuid: string
	) => {
		inPayload: Writable<Payload<FlavorType>>;
		outPayload: Writable<Payload<FlavorType>>;
		monitor: boolean;
	};
	setOutPayload: (flavorUuid: string, usageUuid: string, newPayload: Payload<FlavorType>) => void;
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
		{
			inPayload: Writable<Payload<FlavorType>>;
			outPayload: Writable<Payload<FlavorType>>;
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

		function addPayload(flavor: Flavor, callFor: CallFor) {
			// add flavor to map with params/default
			const parameter = currentParameters.find(
				(parameter) => parameter.flavorUuid == flavor.uuid && parameter.callForUuid == callFor.uuid
			);

			const payload: Writable<Payload<FlavorType>> = writable(
				parameter?.payload || {
					type: flavor.type,
					params: paramsDefaults[flavor.type]
				}
			);
			const monitor = currentConnections.some(
				(connection) =>
					connection.inFlavorUuid == flavor.uuid && connection.inUsageUuid == callFor.usageUuid
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
									callForUuid: callFor.uuid
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
		}

		// if a entry does not exist for every flavor in current flavors, add
		for (const callFor of currentCallsFor.values()) {
			const usage = currentUsages.get(callFor.usageUuid);
			if (!usage) throw `usage ${callFor.usageUuid} not found`;

			for (const flavor of currentFlavors.values()) {
				if (flavor.ingredientUuid == usage.ingredientUuid) {
					addPayload(flavor, callFor);
				}
			}
		}
	});

	// each connection should copy values from out payload to in payload
	recipeState.connections.subscribe((currentConnections) => {
		currentConnections.forEach((connection) => {
			const inFlavorPayloads = flavorUsagePayloads.get(
				getPayloadsKey(connection.inFlavorUuid, connection.inUsageUuid)
			);
			const outFlavorPayloads = flavorUsagePayloads.get(
				getPayloadsKey(connection.outFlavorUuid, connection.outUsageUuid)
			);

			if (!inFlavorPayloads)
				throw `payload for inFlavor ${connection.inFlavorUuid} of usage ${connection.inUsageUuid} not found`;
			if (!outFlavorPayloads)
				throw `payload for outFlavor ${connection.outFlavorUuid} of usage ${connection.outUsageUuid} not found`;

			inFlavorPayloads.inPayload.set(get(outFlavorPayloads.outPayload));
			// this may be too simple for render pipeline setting calculated values
			outFlavorPayloads.outPayload.subscribe((newPayload) => {
				inFlavorPayloads.inPayload.set(newPayload);
			});
		});
	});

	function getPayload(flavorUuid: string, usageUuid: string) {
		const payload = flavorUsagePayloads.get(getPayloadsKey(flavorUuid, usageUuid));
		if (!payload) throw `payload for flavor ${flavorUuid} on usage ${usageUuid} not found`;

		return payload;
	}

	function setOutPayload(flavorUuid: string, usageUuid: string, newPayload: Payload<FlavorType>) {
		const payloads = flavorUsagePayloads.get(getPayloadsKey(flavorUuid, usageUuid));
		if (!payloads) throw `payload for flavor ${flavorUuid} on usage ${usageUuid} not found`;
		payloads.outPayload.set(newPayload);
	}

	return {
		getPayload,
		setOutPayload
	};
}
