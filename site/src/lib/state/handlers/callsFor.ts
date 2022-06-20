import { type ActionHandler, ActionType } from '@state/actions';

export const createCallFor: ActionHandler<ActionType.CreateCallFor, ActionType.DeleteCallFor> = (
	state,
	params
) => {
	state.callsFor.set(params.callFor.uuid, params.callFor);

	return {
		state,
		undoAction: {
			type: ActionType.DeleteCallFor,
			params: {
				uuid: params.callFor.uuid
			}
		}
	};
};

export const deleteCallFor: ActionHandler<ActionType.DeleteCallFor, ActionType.CreateCallFor> = (
	state,
	params
) => {
	// delete call for
	const callFor = state.callsFor.get(params.uuid);
	if (!callFor) throw `CallFor ${params.uuid} does not exist`;
	state.callsFor.delete(params.uuid);

	return {
		state,
		undoAction: { type: ActionType.CreateCallFor, params: { callFor } }
	};
};
