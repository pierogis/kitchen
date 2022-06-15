import type { Connection, Flavor, FullRecipe } from '$lib/common/types';
import { ActionType } from './actions';
import { createConnection, deleteConnection } from './handlers/connections';
import { createIngredient, deleteIngredient } from './handlers/ingredients';

import { createRecipeState } from './stores/recipe';

export function storeRecipe(recipe: FullRecipe) {
	const initialCallsFor = new Map(recipe.callsFor.map((callFor) => [callFor.uuid, callFor]));
	const initialIngredients = new Map(
		recipe.callsFor.map((callFor) => [callFor.ingredientUuid, callFor.ingredient])
	);
	const initialFlavors = new Map(
		recipe.callsFor.reduce<[string, Flavor][]>((previous, callFor) => {
			previous = previous.concat(callFor.ingredient.flavors.map((flavor) => [flavor.uuid, flavor]));

			return previous;
		}, [])
	);
	const initialConnections = new Map(
		recipe.callsFor.reduce<[string, Connection][]>((previous, callFor) => {
			previous = previous.concat(
				callFor.ingredient.connections.map((connection) => [connection.uuid, connection])
			);

			return previous;
		}, [])
	);
	const initialShaders = new Map(recipe.shaders.map((shader) => [shader.uuid, shader]));
	const initialParameters = new Map(
		recipe.parameters.map((parameter) => [parameter.uuid, parameter])
	);
	const initialLocations = new Map(
		recipe.callsFor.map((callFor) => [callFor.location.uuid, callFor.location])
	);

	const recipeState = createRecipeState({
		recipeUuid: recipe.uuid,
		focusedCallForUuid: recipe.mainCallForUuid,
		ingredients: initialIngredients,
		flavors: initialFlavors,
		callsFor: initialCallsFor,
		connections: initialConnections,
		shaders: initialShaders,
		parameters: initialParameters,
		locations: initialLocations
	});

	recipeState.register(ActionType.CreateIngredient, createIngredient);
	recipeState.register(ActionType.DeleteIngredient, deleteIngredient);
	recipeState.register(ActionType.CreateConnection, createConnection);
	recipeState.register(ActionType.DeleteConnection, deleteConnection);

	return recipeState;
}

export const recipeStateContextKey = 'recipe';
export const viewStateContextKey = 'view';
