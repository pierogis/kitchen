import type {
	CallFor,
	Connection,
	Flavor,
	FullRecipe,
	Ingredient,
	Location,
	Shader,
	Parameter
} from '$lib/common/types';
import { writable, type Writable } from 'svelte/store';

export const state: Writable<{
	ingredients: Map<string, Ingredient>;
	flavors: Map<string, Flavor>;
	callsFor: Map<string, CallFor>;
	connections: Map<string, Connection>;
	shaders: Map<string, Shader>;
	parameters: Map<string, Parameter>;
	locations: Map<string, Location>;
}> = writable({
	ingredients: new Map(),
	flavors: new Map(),
	callsFor: new Map(),
	connections: new Map(),
	shaders: new Map(),
	parameters: new Map(),
	locations: new Map()
});

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

	const initialCallsFor = storeCallsFor(recipe);
	const initialIngredients = storeIngredients(recipe);
	const initialFlavors = storeFlavors(recipe);
	const initialConnections = storeConnections(recipe);
	const initialShaders = storeShaders(recipe);
	const initialParameters = storeParameters(recipe);
	const initialLocations = storeLocations(recipe);

	state.set({
		ingredients: initialIngredients,
		flavors: initialFlavors,
		callsFor: initialCallsFor,
		connections: initialConnections,
		shaders: initialShaders,
		parameters: initialParameters,
		locations: initialLocations
	});
}

export { recipeUuid } from './recipe';
export { callsFor } from './callsFor';
export { ingredients } from './ingredients';
export { flavors } from './flavors';
export { connections } from './connections';
export { shaders } from './shaders';
export { parameters } from './parameters';
export { locations } from './locations';
