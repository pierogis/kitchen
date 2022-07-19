import { ActionType, type ActionHandler } from '@state/actions';
import type { RecipeState } from '@recipe';
import { createEntities, deleteEntities } from './common';

const createIngredients: ActionHandler<
	ActionType.CreateIngredients,
	ActionType.DeleteIngredients
> = (stores, params) => {
	const ingredients = createEntities(stores.ingredients, params.ingredients);

	return {
		type: ActionType.DeleteIngredients,
		params: {
			ingredients
		}
	};
};

const deleteIngredients: ActionHandler<
	ActionType.DeleteIngredients,
	ActionType.CreateIngredients
> = (stores, params) => {
	deleteEntities(stores.ingredients, params.ingredients);

	return {
		type: ActionType.CreateIngredients,
		params: {
			ingredients: params.ingredients
		}
	};
};

export function registerIngredientHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateIngredients, createIngredients);
	recipeState.register(ActionType.DeleteIngredients, deleteIngredients);
}
