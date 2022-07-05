import { ActionType, type ActionHandler } from '@state/actions';
import type { RecipeState } from '@recipe';
import { createEntities, deleteEntities } from './common';

const createIngredients: ActionHandler<
	ActionType.CreateIngredients,
	ActionType.DeleteIngredients
> = (stores, params) => {
	const uuids = createEntities(stores.ingredients, params.ingredients);

	return {
		type: ActionType.DeleteIngredients,
		params: {
			uuids
		}
	};
};

const deleteIngredients: ActionHandler<
	ActionType.DeleteIngredients,
	ActionType.CreateIngredients
> = (stores, params) => {
	const ingredients = deleteEntities(stores.ingredients, params.uuids);

	return {
		type: ActionType.CreateIngredients,
		params: {
			ingredients
		}
	};
};

export function registerIngredientHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateIngredients, createIngredients);
	recipeState.register(ActionType.DeleteIngredients, deleteIngredients);
}
