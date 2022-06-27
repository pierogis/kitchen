import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';

const createCallFor: ActionHandler<ActionType.CreateCallFor, ActionType.DeleteCallFor> = (
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

const deleteCallFor: ActionHandler<ActionType.DeleteCallFor, ActionType.CreateCallFor> = (
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

export function registerCallForHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateCallFor, createCallFor);
	recipeState.register(ActionType.DeleteCallFor, deleteCallFor);
}
