import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';
import { createEntities, updateEntities, deleteEntities } from './common';

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

const updatePreps: ActionHandler<ActionType.UpdatePreps, ActionType.UpdatePreps> = (
	stores,
	params
) => {
	const oldPreps = updateEntities(stores.preps, params.preps);

	return {
		type: ActionType.UpdatePreps,
		params: {
			preps: oldPreps
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

export function registerPrepHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreatePreps, createPreps);
	recipeState.register(ActionType.UpdatePreps, updatePreps);
	recipeState.register(ActionType.DeletePreps, deletePreps);
}
