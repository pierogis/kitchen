import { derived, writable, type Writable, type Readable } from 'svelte/store';

import type {
	CallFor,
	Flavor,
	FlavorType,
	Ingredient,
	Parameter,
	Payload,
	Location
} from '$lib/common/types';
import type { ActionableState } from './state';

// view

export type Coordinates = { x: number | undefined; y: number | undefined };

export interface Cable {
	connectionUuid: string;
	inFlavorUuid: string;
	outFlavorUuid: string;
	inCoords: Writable<Coordinates>;
	outCoords: Writable<Coordinates>;
	payload: Writable<Payload<FlavorType>>;
}

export type Node = {
	ingredient: Ingredient;
	flavors: Flavor[];
	location: Location;
	callFor: CallFor;
};

export interface View {
	cables: Cable[];
	nodes: Node[];
	dockedFlavors: Flavor[];
	dragCoords: Writable<Coordinates>;
}

export type ReadableView = {
	[key in keyof View]: Readable<View[key]>;
};

export function readableView(state: ActionableState): ReadableView {
	const cables: Readable<Cable[]> = derived(
		[state.ingredients, state.connections, state.parameters],
		([currentIngredients, currentConnections, currentParameters]) =>
			Array.from(currentConnections.values()).map((connection) => {
				// get the flavor corresponding to the connection's outputting, "source" flavor ->
				const outFlavor = currentIngredients.get(connection.outFlavorUuid);
				if (outFlavor) {
					// get the parameter for this
					const outParameter: Parameter | undefined = Array.from(currentParameters.values()).find(
						(parameter) => parameter.flavorUuid == outFlavor.uuid
					);

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
	const nodes: Readable<Node[]> = derived(
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

				return { ingredient, flavors: ingredientFlavors, location, callFor };
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
		dockedFlavors,
		dragCoords
	};
}
