import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';
import { createEntities, updateEntities, deleteEntities } from './common';

const createFlavors: ActionHandler<ActionType.CreateFlavors, ActionType.DeleteFlavors> = (
	stores,
	params
) => {
	const flavors = createEntities(stores.flavors, params.flavors);

	return {
		type: ActionType.DeleteFlavors,
		params: {
			flavors
		}
	};
};

const deleteFlavors: ActionHandler<ActionType.DeleteFlavors, ActionType.CreateFlavors> = (
	stores,
	params
) => {
	deleteEntities(stores.flavors, params.flavors);

	return {
		type: ActionType.CreateFlavors,
		params: {
			flavors: params.flavors
		}
	};
};

export function registerFlavorHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateFlavors, createFlavors);
	recipeState.register(ActionType.DeleteFlavors, deleteFlavors);
}
