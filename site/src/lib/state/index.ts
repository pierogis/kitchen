import type { Connection, Flavor, FullRecipe, Usage } from '@types';
import { ActionType } from './actions';

import { createCallFor, deleteCallFor } from './handlers/callsFor';
import { createConnection, deleteConnection, updateConnection } from './handlers/connections';
import { createFlavor, deleteFlavor } from './handlers/flavors';
import { createIngredient, deleteIngredient } from './handlers/ingredients';
import { createLocation, deleteLocation } from './handlers/locations';
import { createUsage, deleteUsage } from './handlers/usages';

import { createRecipeState } from './stores/recipe';

export function storeRecipe(recipe: FullRecipe) {
	const initialCallsFor = new Map(recipe.callsFor.map((callFor) => [callFor.uuid, callFor]));
	const initialIngredients = new Map(
		recipe.ingredients.map((ingredient) => [ingredient.uuid, ingredient])
	);
	const initialUsages = new Map(
		recipe.ingredients.reduce<[string, Usage][]>((previous, ingredient) => {
			previous = previous.concat(ingredient.usages.map((usage) => [usage.uuid, usage]));

			return previous;
		}, [])
	);
	const initialFlavors = new Map(
		recipe.ingredients.reduce<[string, Flavor][]>((previous, ingredient) => {
			previous = previous.concat(ingredient.flavors.map((flavor) => [flavor.uuid, flavor]));

			return previous;
		}, [])
	);
	const initialConnections = new Map(
		recipe.ingredients.reduce<[string, Connection][]>((previous, ingredient) => {
			previous = previous.concat(
				ingredient.connections.map((connection) => [connection.uuid, connection])
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

	const mainCallFor = initialCallsFor.get(recipe.mainCallForUuid);
	if (!mainCallFor) throw `main callFor ${recipe.mainCallForUuid} not found`;

	const mainUsage = initialUsages.get(mainCallFor.usageUuid);
	if (!mainUsage) throw `main usage ${recipe.mainCallForUuid} not found`;

	const recipeState = createRecipeState({
		recipeUuid: recipe.uuid,
		focusedIngredientUuid: mainUsage.ingredientUuid,
		focusedUsageUuid: mainUsage.uuid,
		ingredients: initialIngredients,
		flavors: initialFlavors,
		callsFor: initialCallsFor,
		connections: initialConnections,
		shaders: initialShaders,
		parameters: initialParameters,
		locations: initialLocations,
		usages: initialUsages
	});

	recipeState.register(ActionType.CreateIngredient, createIngredient);
	recipeState.register(ActionType.DeleteIngredient, deleteIngredient);

	recipeState.register(ActionType.CreateConnection, createConnection);
	recipeState.register(ActionType.UpdateConnection, updateConnection);
	recipeState.register(ActionType.DeleteConnection, deleteConnection);

	recipeState.register(ActionType.CreateCallFor, createCallFor);
	recipeState.register(ActionType.DeleteCallFor, deleteCallFor);

	recipeState.register(ActionType.CreateFlavor, createFlavor);
	recipeState.register(ActionType.DeleteFlavor, deleteFlavor);

	recipeState.register(ActionType.CreateLocation, createLocation);
	recipeState.register(ActionType.DeleteLocation, deleteLocation);

	recipeState.register(ActionType.CreateUsage, createUsage);
	recipeState.register(ActionType.DeleteUsage, deleteUsage);

	return recipeState;
}

export const recipeStateContextKey = 'recipe';
export const viewStateContextKey = 'view';
