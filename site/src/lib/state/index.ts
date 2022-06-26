import type { Connection, Flavor, FullRecipe, Usage } from '@types';

import { registerCallForHandlers } from './handlers/callsFor';
import { registerConnectionHandlers } from './handlers/connections';
import { registerFlavorHandlers } from './handlers/flavors';
import { registerIngredientHandlers } from './handlers/ingredients';
import { registerLocationHandlers } from './handlers/locations';
import { registerParameterHandlers } from './handlers/parameters';
import { registerUsageHandlers } from './handlers/usages';

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

	registerIngredientHandlers(recipeState);
	registerFlavorHandlers(recipeState);
	registerUsageHandlers(recipeState);
	registerConnectionHandlers(recipeState);
	registerCallForHandlers(recipeState);
	registerLocationHandlers(recipeState);
	registerParameterHandlers(recipeState);

	return recipeState;
}
