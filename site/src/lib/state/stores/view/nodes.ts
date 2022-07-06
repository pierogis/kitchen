import { derived, get, type Readable } from 'svelte/store';

import type { CallFor, Flavor, Ingredient, Location, Usage } from '@types';
import type { RecipeState } from '@recipe';

export type Node = {
	ingredient: Ingredient;
	flavors: Flavor[];
	location: Location;
	callFor: CallFor;
};

export function createNodes(
	recipeState: RecipeState,
	inFocusSubComponents: Readable<{ usage: Usage; ingredient: Ingredient }[]>
): Readable<Node[]> {
	// collapse the store maps into a list of currently-in-view ingredients with flavors and location
	const nodes: Readable<Node[]> = derived([inFocusSubComponents], ([$inFocusSubComponents]) => {
		const allCallsFor = Array.from(get(recipeState.callsFor).values());
		const allFlavors = Array.from(get(recipeState.flavors).values());
		const allLocations = Array.from(get(recipeState.locations).values());

		return $inFocusSubComponents.map(({ usage, ingredient }) => {
			// get the flavors that attach to this ingredient
			const flavors = allFlavors.filter((flavor) => flavor.ingredientUuid == usage.ingredientUuid);

			const callFor = allCallsFor.find((callFor) => callFor.usageUuid == usage.uuid);
			if (!callFor) throw `callFor referencing usage ${usage.uuid} not found`;

			// find location that matches this callFor
			const location = allLocations.find((location) => location.callForUuid == callFor.uuid);
			if (!location) throw `location referencing callFor ${callFor.usageUuid} not found`;

			return { ingredient, flavors, location, callFor };
		});
	});

	return nodes;
}
