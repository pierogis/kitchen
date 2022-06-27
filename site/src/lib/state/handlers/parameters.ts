import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';

const createParameter: ActionHandler<ActionType.CreateParameter, ActionType.DeleteParameter> = (
	state,
	params
) => {
	state.parameters.set(params.parameter.uuid, params.parameter);

	return {
		state,
		undoAction: {
			type: ActionType.DeleteParameter,
			params: {
				uuid: params.parameter.uuid
			}
		}
	};
};

const updateParameter: ActionHandler<ActionType.UpdateParameter, ActionType.UpdateParameter> = (
	state,
	params
) => {
	const oldParameter = state.parameters.get(params.parameter.uuid);

	if (!oldParameter) throw `parameter ${params.parameter.uuid} not found`;

	state.parameters.set(params.parameter.uuid, params.parameter);

	return {
		state,
		undoAction: {
			type: ActionType.UpdateParameter,
			params: { parameter: oldParameter }
		}
	};
};

const deleteParameter: ActionHandler<ActionType.DeleteParameter, ActionType.CreateParameter> = (
	state,
	params
) => {
	// delete parameter
	const parameter = state.parameters.get(params.uuid);
	if (!parameter) throw `Parameter ${params.uuid} does not exist`;
	state.parameters.delete(params.uuid);

	return {
		state,
		undoAction: { type: ActionType.CreateParameter, params: { parameter } }
	};
};

export function registerParameterHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateParameter, createParameter);
	recipeState.register(ActionType.UpdateParameter, updateParameter);
	recipeState.register(ActionType.DeleteParameter, deleteParameter);
}
