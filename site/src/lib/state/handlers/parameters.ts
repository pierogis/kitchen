import { type ActionHandler, ActionType } from '../actions';

export const createParameter: ActionHandler<
	ActionType.CreateParameter,
	ActionType.DeleteParameter
> = (state, params) => {
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

export const deleteParameter: ActionHandler<
	ActionType.DeleteParameter,
	ActionType.CreateParameter
> = (state, params) => {
	// delete parameter
	const parameter = state.parameters.get(params.uuid);
	if (!parameter) throw `Parameter ${params.uuid} does not exist`;
	state.parameters.delete(params.uuid);

	return {
		state,
		undoAction: { type: ActionType.CreateParameter, params: { parameter } }
	};
};
