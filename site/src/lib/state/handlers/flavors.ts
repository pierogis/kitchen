import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';
import { createEntities, deleteEntities } from './common';

const createFlavors: ActionHandler<ActionType.CreateFlavors, ActionType.DeleteFlavors> = (
	stores,
	params
) => {
	const uuids = createEntities(stores.flavors, params.flavors);

	return {
		type: ActionType.DeleteFlavors,
		params: {
			uuids
		}
	};
};

const deleteFlavors: ActionHandler<ActionType.DeleteFlavors, ActionType.CreateFlavors> = (
	stores,
	params
) => {
	const flavors = deleteEntities(stores.flavors, params.uuids);

	return {
		type: ActionType.CreateFlavors,
		params: {
			flavors
		}
	};
};

export function registerFlavorHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateFlavors, createFlavors);
	recipeState.register(ActionType.DeleteFlavors, deleteFlavors);
}
