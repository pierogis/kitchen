import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';

const createParameters: ActionHandler<ActionType.CreateParameters, ActionType.DeleteParameters> = (
	state,
	params
) => {
	const uuids = params.parameters.map((parameter) => {
		state.parameters.set(parameter.uuid, parameter);

		return parameter.uuid;
	});

	return {
		state,
		undoAction: {
			type: ActionType.DeleteParameters,
			params: {
				uuids
			}
		}
	};
};

const updateParameters: ActionHandler<ActionType.UpdateParameters, ActionType.UpdateParameters> = (
	state,
	params
) => {
	const parameters = params.parameters.map((parameter) => {
		const oldParameter = state.parameters.get(parameter.uuid);
		if (!oldParameter) {
			throw `parameter ${parameter.uuid} does not exist`;
		}

		state.parameters.set(parameter.uuid, parameter);
		return oldParameter;
	});

	return {
		state,
		undoAction: {
			type: ActionType.UpdateParameters,
			params: { parameters }
		}
	};
};

const deleteParameters: ActionHandler<ActionType.DeleteParameters, ActionType.CreateParameters> = (
	state,
	params
) => {
	const parameters = params.uuids.map((uuid) => {
		const parameter = state.parameters.get(uuid);
		if (!parameter) throw 'parameter ${uuid} does not exist';

		// delete parameter
		state.parameters.delete(uuid);
		return parameter;
	});

	return {
		state,
		undoAction: { type: ActionType.CreateParameters, params: { parameters } }
	};
};

export function registerParameterHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateParameters, createParameters);
	recipeState.register(ActionType.UpdateParameters, updateParameters);
	recipeState.register(ActionType.DeleteParameters, deleteParameters);
}
