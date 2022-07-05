import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';
import { createEntities, deleteEntities, updateEntities } from './common';

const createParameters: ActionHandler<ActionType.CreateParameters, ActionType.DeleteParameters> = (
	stores,
	params
) => {
	const uuids = createEntities(stores.parameters, params.parameters);

	return {
		type: ActionType.DeleteParameters,
		params: {
			uuids
		}
	};
};

const updateParameters: ActionHandler<ActionType.UpdateParameters, ActionType.UpdateParameters> = (
	stores,
	params
) => {
	const oldParameters = updateEntities(stores.parameters, params.parameters);

	return {
		type: ActionType.UpdateParameters,
		params: { parameters: oldParameters }
	};
};

const deleteParameters: ActionHandler<ActionType.DeleteParameters, ActionType.CreateParameters> = (
	stores,
	params
) => {
	const parameters = deleteEntities(stores.parameters, params.uuids);

	return {
		type: ActionType.CreateParameters,
		params: {
			parameters
		}
	};
};

export function registerParameterHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateParameters, createParameters);
	recipeState.register(ActionType.UpdateParameters, updateParameters);
	recipeState.register(ActionType.DeleteParameters, deleteParameters);
}
