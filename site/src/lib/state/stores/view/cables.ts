import { derived, writable, type Readable, type Writable } from 'svelte/store';

import type { Flavor, FlavorType, Ingredient, Parameter, Payload } from '$lib/common/types';

import type { RecipeState } from '../recipe';
import type { Coordinates } from '../view';

export interface Cable {
	connectionUuid: string;
	flavorType: FlavorType;
	inFlavorUuid: string;
	outFlavorUuid: string;
	inCoordinates: Writable<Coordinates | undefined>;
	outCoordinates: Writable<Coordinates | undefined>;
	payload: Writable<Payload<FlavorType>>;
}

export function createCables(
	state: RecipeState,
	focusedIngredient: Readable<Ingredient>
): Readable<Cable[]> {
	const focusedConnections = derived(
		[focusedIngredient, state.connections],
		([currentFocusedIngredient, currentConnections]) =>
			Array.from(currentConnections.values()).filter(
				(connection) => connection.parentIngredientUuid == currentFocusedIngredient.uuid
			)
	);

	const cables: Readable<Cable[]> = derived(
		[focusedConnections, state.parameters, state.flavors],
		([currentFocusedConnections, currentParameters, currentFlavors]) => {
			return currentFocusedConnections.map((connection) => {
				// get the parameter corresponding to the connection's outputting, "source" flavor ->
				const outParameter: Parameter | undefined = Array.from(currentParameters.values()).find(
					(parameter) => parameter.flavorUuid == connection.outFlavorUuid
				);

				if (!outParameter) {
					throw `outParameter for flavor ${connection.outFlavorUuid} not found`;
				}

				const inFlavor: Flavor | undefined = Array.from(currentFlavors.values()).find(
					(flavor) => flavor.uuid == connection.inFlavorUuid
				);

				if (!inFlavor) {
					throw `inFlavor ${connection.inFlavorUuid} for connection ${connection.uuid} not found`;
				}

				const outFlavor: Flavor | undefined = Array.from(currentFlavors.values()).find(
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
					payload: writable(outParameter.payload)
				};
			});
		}
	);

	return cables;
}
