import type { CallFor, Flavor, Ingredient, Location } from '$lib/common/types';
import { derived, type Readable } from 'svelte/store';

import type { RecipeState } from '../recipe';
import type { ViewState } from '../view';
import type { Cable } from './cables';
import { type Terminal, createTerminals } from './terminals';

export type Node = {
	ingredient: Readable<Ingredient>;
	flavors: Readable<
		(Flavor & {
			terminals: Readable<Terminal[]>;
		})[]
	>;
	location: Readable<Location>;
	callFor: CallFor;
};

export function createNodes(
	recipeState: RecipeState,
	focusedCallsFor: Readable<CallFor[]>,
	cables: Readable<Cable[]>
): Readable<Node[]> {
	// collapse the stores into a list of currently-in-view ingredients with flavors and location
	const nodes: Readable<Node[]> = derived([focusedCallsFor], ([currentFocusedCallsFor]) => {
		return Array.from(currentFocusedCallsFor.values()).map((callFor) => {
			// find ingredient that matches this callFor
			const ingredient = derived(recipeState.ingredients, (currentIngredients) => {
				// find ingredient that matches this callFor
				const ingredient = currentIngredients.get(callFor.ingredientUuid);

				if (!ingredient) {
					throw "Couldn't find referenced ingredient";
				}

				return ingredient;
			});

			const location = derived(recipeState.locations, (currentLocations) => {
				// find location that matches this callFor
				const location = Array.from(currentLocations.values()).find(
					(location) => location.callForUuid == callFor.uuid
				);

				if (!location) {
					throw "Couldn't find referenced location";
				}

				return location;
			});

			const flavors = derived(
				[recipeState.flavors, ingredient],
				([currentFlavors, currentIngredient]) => {
					// get the flavors that attach to this ingredient
					return Array.from(currentFlavors.values())
						.filter((flavor) => flavor.ingredientUuid == currentIngredient.uuid)
						.map((flavor) => {
							return {
								...flavor,
								terminals: createTerminals(flavor, cables)
							};
						});
				}
			);

			return { ingredient, flavors, location, callFor };
		});
	});

	return nodes;
}
