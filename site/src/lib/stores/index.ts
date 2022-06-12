import type { FullRecipe } from '$lib/common/types';

import { recipeUuid } from './recipe';
import { storeCallsFor } from './callsFor';
import { storeIngredients } from './ingredients';
import { storeFlavors } from './flavors';
import { storeConnections } from './connections';
import { storeShaders } from './shaders';
import { storeParameters } from './parameters';
import { storeLocations } from './locations';

export function storeRecipe(recipe: FullRecipe) {
	recipeUuid.set(recipe.uuid);

	storeCallsFor(recipe);
	storeIngredients(recipe);
	storeFlavors(recipe);
	storeConnections(recipe);
	storeShaders(recipe);
	storeParameters(recipe);
	storeLocations(recipe);
}

export { recipeUuid } from './recipe';
export { callsFor } from './callsFor';
export { ingredients } from './ingredients';
export { flavors } from './flavors';
export { connections } from './connections';
export { shaders } from './shaders';
export { parameters } from './parameters';
export { locations } from './locations';
