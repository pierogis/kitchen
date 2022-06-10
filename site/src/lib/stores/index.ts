import type { FullRecipe } from '$lib/common/types';
import { flattenIngredients, ingredients } from './ingredients';
import { flattenFlavors, flavors } from './flavors';
import { flattenConnections, connections } from './connections';
import { flattenShaders, shaders } from './shaders';
import { flattenParameters, parameters } from './parameters';

export function flattenRecipe(recipe: FullRecipe) {
	ingredients.set(flattenIngredients(recipe));
	flavors.set(flattenFlavors(recipe));
	connections.set(flattenConnections(recipe));
	shaders.set(flattenShaders(recipe));
	parameters.set(flattenParameters(recipe));
}

export { ingredients } from './ingredients';
export { flavors } from './flavors';
export { connections } from './connections';
export { parameters } from './parameters';
export { shaders } from './shaders';
