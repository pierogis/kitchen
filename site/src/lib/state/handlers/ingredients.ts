import { ActionType, type ActionHandler } from '@state/actions';
import type { RecipeState } from '@recipe';

const createIngredients: ActionHandler<
	ActionType.CreateIngredients,
	ActionType.DeleteIngredients
> = (state, params) => {
	const uuids = params.ingredients.map((ingredient) => {
		state.ingredients.set(ingredient.uuid, ingredient);

		return ingredient.uuid;
	});

	return {
		state,
		undoAction: {
			type: ActionType.DeleteIngredients,
			params: { uuids }
		}
	};
};

const deleteIngredients: ActionHandler<
	ActionType.DeleteIngredients,
	ActionType.CreateIngredients
> = (state, params) => {
	const ingredients = params.uuids.map((uuid) => {
		const ingredient = state.ingredients.get(uuid);
		if (!ingredient) throw 'ingredient ${uuid} does not exist';

		// delete ingredient
		state.ingredients.delete(uuid);
		return ingredient;
	});

	return {
		state,
		undoAction: {
			type: ActionType.CreateIngredients,
			params: { ingredients }
		}
	};
};

export function registerIngredientHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateIngredients, createIngredients);
	recipeState.register(ActionType.DeleteIngredients, deleteIngredients);
}
