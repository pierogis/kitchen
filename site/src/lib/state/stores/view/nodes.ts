import type { CallFor, Flavor, Ingredient, Location } from '$lib/common/types';
import { derived, type Readable } from 'svelte/store';

import type { RecipeState } from '$lib/state/stores/recipe';

export type Node = {
	ingredient: Ingredient;
	flavors: Flavor[];
	location: Location;
	callFor: CallFor;
};

export function createNodes(
	recipeState: RecipeState,
	focusedCallsFor: Readable<CallFor[]>
): Readable<Node[]> {
	// collapse the store maps into a list of currently-in-view ingredients with flavors and location
	const nodes: Readable<Node[]> = derived(
		[focusedCallsFor, recipeState.ingredients, recipeState.locations, recipeState.flavors],
		([currentFocusedCallsFor, currentIngredients, currentLocations, currentFlavors]) => {
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
				const flavors = Array.from(currentFlavors.values()).filter(
					(flavor) => flavor.ingredientUuid == ingredient.uuid
				);
				return { ingredient, flavors, location, callFor };
			});
		}
	);

	return nodes;
}
