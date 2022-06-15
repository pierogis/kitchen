import type { CallFor, Flavor, Ingredient, Location } from '$lib/common/types';
import { derived, type Readable } from 'svelte/store';

import type { RecipeState } from '../recipe';
import type { ViewState } from '../view';
import type { Cable } from './cables';
import { type Terminal, createTerminals } from './terminals';

export type Node = {
	ingredient: Ingredient;
	flavors: (Flavor & {
		terminals: Terminal[];
	})[];
	location: Location;
	callFor: CallFor;
};

export function createNodes(
	recipeState: RecipeState,
	focusedCallsFor: Readable<CallFor[]>,
	cables: Readable<Cable[]>
): Readable<Node[]> {
	// collapse the store maps into a list of currently-in-view ingredients with flavors and location
	const nodes: Readable<Node[]> = derived(
		[focusedCallsFor, recipeState.ingredients, recipeState.locations, recipeState.flavors, cables],
		([
			currentFocusedCallsFor,
			currentIngredients,
			currentLocations,
			currentFlavors,
			currentCables
		]) => {
			return Array.from(currentFocusedCallsFor.values()).map((callFor) => {
				// find ingredient that matches this callFor
				const ingredient = currentIngredients.get(callFor.ingredientUuid);

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
				const flavors = Array.from(currentFlavors.values())
					.filter((flavor) => flavor.ingredientUuid == ingredient.uuid)
					.map((flavor) => {
						return {
							...flavor,
							terminals: createTerminals(flavor, currentCables)
						};
					});
				return { ingredient, flavors, location, callFor };
			});
		}
	);

	return nodes;
}

// NESTED STORES METHOD

// export function createNodes(
// 	recipeState: RecipeState,
// 	focusedCallsFor: Readable<CallFor[]>,
// 	cables: Readable<Cable[]>
// ): Readable<Node[]> {
// 	// collapse the store maps into a list of currently-in-view ingredients with flavors and location
// 	const nodes: Readable<Node[]> = derived([focusedCallsFor], ([currentFocusedCallsFor]) => {
// 		return Array.from(currentFocusedCallsFor.values()).map((callFor) => {
// 			// find ingredient that matches this callFor
// 			const ingredient = derived(recipeState.ingredients, (currentIngredients, set) => {
// 				// this function fires before currentFocusedCallsFor changes
// 				const ingredient = currentIngredients.get(callFor.ingredientUuid);

// 				if (!ingredient) {
// 					throw "Couldn't find referenced ingredient";
// 				}
// 				set(ingredient);

// 				return () => {};
// 			});

// 			// find location that matches this callFor
// 			const location = derived(recipeState.locations, (currentLocations) => {
// 				const location = Array.from(currentLocations.values()).find(
// 					(location) => location.callForUuid == callFor.uuid
// 				);

// 				if (!location) {
// 					throw "Couldn't find referenced location";
// 				}

// 				return location;
// 			});

// 			const flavors = derived(
// 				[recipeState.flavors, ingredient],
// 				([currentFlavors, currentIngredient]) => {
// 					// get the flavors that attach to this ingredient
// 					return Array.from(currentFlavors.values())
// 						.filter((flavor) => flavor.ingredientUuid == currentIngredient.uuid)
// 						.map((flavor) => {
// 							return {
// 								...flavor,
// 								terminals: createTerminals(flavor, cables)
// 							};
// 						});
// 				}
// 			);

// 			return { ingredient, flavors, location, callFor };
// 		});
// 	});

// 	return nodes;
// }
