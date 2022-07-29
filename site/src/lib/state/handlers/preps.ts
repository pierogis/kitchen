import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';
import { createEntities, deleteEntities } from './common';

const createPreps: ActionHandler<ActionType.CreatePreps, ActionType.DeletePreps> = (
	stores,
	params
) => {
	const preps = createEntities(stores.preps, params.preps);

	return {
		type: ActionType.DeletePreps,
		params: {
			preps
		}
	};
};

const deletePreps: ActionHandler<ActionType.DeletePreps, ActionType.CreatePreps> = (
	stores,
	params
) => {
	deleteEntities(stores.preps, params.preps);

	return {
		type: ActionType.CreatePreps,
		params: {
			preps: params.preps
		}
	};
};

export function registerFlavorHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreatePreps, createPreps);
	recipeState.register(ActionType.DeletePreps, deletePreps);
}
