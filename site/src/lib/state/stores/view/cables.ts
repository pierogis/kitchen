import { derived, writable, type Readable, type Writable } from 'svelte/store';

import { Direction, type FlavorType, type Ingredient, type Payload } from '$lib/common/types';

import type { RecipeState } from '$lib/state/stores/recipe';
import type { Coordinates } from '.';
import type { LiveConnectionState } from './liveConnection';

export interface Cable {
	connectionUuid: string;
	flavorType: FlavorType;
	inFlavorUuid: string | undefined;
	outFlavorUuid: string | undefined;
	inCoordinates: Writable<Coordinates | undefined>;
	outCoordinates: Writable<Coordinates | undefined>;
	payload: Writable<Payload<FlavorType>>;
}

export function createCables(
	state: RecipeState,
	focusedIngredient: Readable<Ingredient>,
	liveConnection: LiveConnectionState
): Readable<Cable[]> {
	const focusedConnections = derived(
		[focusedIngredient, state.connections],
		([currentFocusedIngredient, currentConnections]) =>
			Array.from(currentConnections.values()).filter(
				(connection) => connection.parentIngredientUuid == currentFocusedIngredient.uuid
			)
	);

	const cables: Readable<Cable[]> = derived(
		[focusedConnections, state.parameters, state.flavors, liveConnection],
		([currentFocusedConnections, currentParameters, currentFlavors, currentLiveConnection]) => {
			let cables: Cable[] = currentFocusedConnections.map((connection) => {
				// get the parameter corresponding to the connection's outputting, "source" flavor ->
				const outParameter = Array.from(currentParameters.values()).find(
					(parameter) => parameter.flavorUuid == connection.outFlavorUuid
				);

				const inFlavor = Array.from(currentFlavors.values()).find(
					(flavor) => flavor.uuid == connection.inFlavorUuid
				);

				if (!inFlavor) {
					throw `inFlavor ${connection.inFlavorUuid} for connection ${connection.uuid} not found`;
				}

				const outFlavor = Array.from(currentFlavors.values()).find(
					(flavor) => flavor.uuid == connection.outFlavorUuid
				);

				if (!outFlavor) {
					throw `outFlavor ${connection.outFlavorUuid} for connection ${connection.uuid} not found`;
				}

				return {
					connectionUuid: connection.uuid,
					flavorType: outFlavor.type,
					inFlavorUuid: connection.inFlavorUuid,
					outFlavorUuid: connection.outFlavorUuid,
					inCoordinates: writable(undefined),
					outCoordinates: writable(undefined),
					payload: writable({ ...outParameter?.payload, type: outFlavor.type })
				};
			});

			if (currentLiveConnection) {
				cables.push({
					connectionUuid: currentLiveConnection.connectionUuid,
					flavorType: currentLiveConnection.flavorType,
					inFlavorUuid:
						currentLiveConnection.anchorDirection == Direction.In
							? currentLiveConnection.anchorFlavorUuid
							: undefined,
					outFlavorUuid:
						currentLiveConnection.anchorDirection == Direction.Out
							? currentLiveConnection.anchorFlavorUuid
							: undefined,
					inCoordinates: writable(undefined),
					outCoordinates: writable(undefined),
					payload: writable({ type: currentLiveConnection.flavorType })
				});
			}

			return cables;
		}
	);

	return cables;
}
