import { derived, writable, type Writable, type Readable } from 'svelte/store';

import type {
	Flavor,
	FlavorType,
	Ingredient,
	Parameter,
	Payload,
	Location
} from '$lib/common/types';
import type { State, WritableState } from './state';

// view

export interface Cable {
	connectionUuid: string;
	inFlavorUuid: string;
	outFlavorUuid: string;
	inCoords: Writable<{ x: number | undefined; y: number | undefined }>;
	outCoords: Writable<{ x: number | undefined; y: number | undefined }>;
	payload: Writable<Payload<FlavorType>>;
}

export type Node = Ingredient & { flavors: Flavor[]; location: Location };

export interface View {
	cables: Cable[];
	nodes: Node[];
	dockedFlavors: Flavor[];
}

export type ReadableView = {
	[key in keyof View]: Readable<View[key]>;
};

export function readableView(state: WritableState): ReadableView {
	const cables: Readable<Cable[]> = derived([state], ([currentState]) =>
		Array.from(currentState.connections.values()).map((connection) => {
			// get the flavor corresponding to the connection's outputting, "source" flavor ->
			const outFlavor = currentState.ingredients.get(connection.outFlavorUuid);
			if (outFlavor) {
				// get the parameter for this
				const outParameter: Parameter | undefined = Array.from(
					currentState.parameters.values()
				).find((parameter) => parameter.flavorUuid == outFlavor.uuid);

				if (outParameter) {
					return {
						connectionUuid: connection.uuid,
						inFlavorUuid: connection.inFlavorUuid,
						outFlavorUuid: connection.outFlavorUuid,
						inCoords: writable({ x: undefined, y: undefined }),
						outCoords: writable({ x: undefined, y: undefined }),
						payload: writable(outParameter.payload)
					};
				} else {
					throw `outParameter for flavor ${outFlavor.uuid} not found`;
				}
			} else {
				throw `outFlavor ${connection.outFlavorUuid} for connection ${connection.uuid} not found`;
			}
		})
	);

	const focusedCallsFor = derived(
		[state.callsFor, state.ingredients, state.focusedCallForUuid],
		([currentCallsFor, currentIngredients, currentFocusedCallForUuid]) =>
			Array.from(currentCallsFor.values()).filter(
				(callFor) => callFor.parentCallForUuid == currentFocusedCallForUuid
			)
	);

	// collapse the stores into a list of currently-in-view ingredients with flavors and location
	const nodes: Readable<(Ingredient & { flavors: Flavor[]; location: Location })[]> = derived(
		[focusedCallsFor, state.ingredients, state.flavors, state.locations],
		([currentFocusedCallsFor, currentIngredients, currentFlavors, currentLocations]) => {
			return Array.from(currentFocusedCallsFor.values()).map((callFor) => {
				// find ingredient that matches this callFor
				const ingredient = currentIngredients.get(callFor.ingredientUuid);

				// find ingredient that matches this callFor
				if (!ingredient) {
					throw "Couldn't find referenced ingredient";
				}

				// find location that matches this callFor
				const location = Array.from(currentLocations.values()).find(
					(location) => location.callForUuid == callFor.uuid
				);

				if (!location) {
					throw "Couldn't find referenced location";
				}

				// get the flavors that attach to this ingredient
				const ingredientFlavors = Array.from(currentFlavors.values()).filter(
					(flavor) => flavor.ingredientUuid == ingredient.uuid
				);

				return { ...ingredient, flavors: ingredientFlavors, location };
			});
		}
	);

	// used for the side docks
	const dockedFlavors = derived(
		[state.flavors, state.focusedCallForUuid],
		([currentFlavors, currentFocusedCallForUuid]) => {
			return Array.from(currentFlavors.values()).filter(
				(flavor) => flavor.ingredientUuid == currentFocusedCallForUuid
			);
		}
	);

	return {
		cables,
		nodes,
		dockedFlavors
	};
}
