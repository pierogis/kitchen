import { derived, get, type Readable } from 'svelte/store';

import type { CallFor, Flavor, Ingredient, Location } from '@types';
import type { RecipeState } from '@recipe';

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
		const allCallsFor = Array.from(get(recipeState.callsFor).values());
		const allFlavors = Array.from(get(recipeState.flavors).values());
		const allLocations = Array.from(get(recipeState.locations).values());

		return currentFocusedSubIngredients.flatMap((ingredient) => {
			// find callsFor that match this ingredient
			const callsFor = allCallsFor.filter((callFor) => callFor.ingredientUuid == ingredient.uuid);

			// get the flavors that attach to this ingredient
			const flavors = allFlavors.filter((flavor) => flavor.ingredientUuid == ingredient.uuid);

			return callsFor.map((callFor) => {
				// find location that matches this callFor
				const location = allLocations.find((location) => location.callForUuid == callFor.uuid);

				if (!location) {
					throw `Couldn't find Location referencing CallFor ${callFor.uuid}`;
				}
				return { ingredient, flavors, location, callFor };
			});
		});
	});

	return nodes;
}
