import type { CallFor, Flavor, Ingredient, Location } from '$lib/common/types';
import { derived, get, type Readable } from 'svelte/store';

import type { RecipeState } from '$lib/state/stores/recipe';

export type Node = {
	ingredient: Ingredient;
	flavors: Flavor[];
	location: Location;
	callFor: CallFor;
};

export function createNodes(
	recipeState: RecipeState,
	focusedSubIngredients: Readable<Ingredient[]>
): Readable<Node[]> {
	// collapse the store maps into a list of currently-in-view ingredients with flavors and location
	const nodes: Readable<Node[]> = derived(focusedSubIngredients, (currentFocusedSubIngredients) => {
		return Array.from(currentFocusedSubIngredients.values()).map((ingredient) => {
			// find callFor that matches this ingredient
			const callFor = Array.from(get(recipeState.callsFor).values()).find(
				(callFor) => callFor.ingredientUuid == ingredient.uuid
			);

			if (!callFor) {
				throw `Couldn't find CallFor referencing Ingredient ${ingredient.uuid}`;
			}

			// find location that matches this ingredient
			const location = Array.from(get(recipeState.locations).values()).find(
				(location) => location.callForUuid == callFor.uuid
			);

			if (!location) {
				throw `Couldn't find Location referencing CallFor ${callFor.uuid}`;
			}

			// get the flavors that attach to this ingredient
			const flavors = Array.from(get(recipeState.flavors).values()).filter(
				(flavor) => flavor.ingredientUuid == ingredient.uuid
			);
			return { ingredient, flavors, location, callFor };
		});
	});

	return nodes;
}
