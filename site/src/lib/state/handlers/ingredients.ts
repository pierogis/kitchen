import { ActionType, type ActionHandler } from '@state/actions';
import type { RecipeState } from '@recipe';

const createIngredient: ActionHandler<ActionType.CreateIngredient, ActionType.DeleteIngredient> = (
	state,
	params
) => {
	state.ingredients.set(params.ingredient.uuid, params.ingredient);

	return {
		state,
		undoAction: {
			type: ActionType.DeleteIngredient,
			params: { uuid: params.ingredient.uuid }
		}
	};
};

const deleteIngredient: ActionHandler<ActionType.DeleteIngredient, ActionType.CreateIngredient> = (
	state,
	params
) => {
	// delete ingredient
	const ingredient = state.ingredients.get(params.uuid);
	if (!ingredient) throw '';
	state.ingredients.delete(ingredient.uuid);

	return {
		state,
		undoAction: {
			type: ActionType.CreateIngredient,
			params: { ingredient }
		}
	};
};

export function registerIngredientHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateIngredient, createIngredient);
	recipeState.register(ActionType.DeleteIngredient, deleteIngredient);
}
