import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';

const createCallsFor: ActionHandler<ActionType.CreateCallsFor, ActionType.DeleteCallsFor> = (
	state,
	params
) => {
	const uuids = params.callsFor.map((callFor) => {
		state.callsFor.set(callFor.uuid, callFor);
		return callFor.uuid;
	});

	return {
		state,
		undoAction: {
			type: ActionType.DeleteCallsFor,
			params: {
				uuids
			}
		}
	};
};

const deleteCallsFor: ActionHandler<ActionType.DeleteCallsFor, ActionType.CreateCallsFor> = (
	state,
	params
) => {
	const callsFor = params.uuids.map((uuid) => {
		const callFor = state.callsFor.get(uuid);
		if (!callFor) throw `callFor ${uuid} does not exist`;

		// delete call for
		state.callsFor.delete(uuid);

		return callFor;
	});

	return {
		state,
		undoAction: { type: ActionType.CreateCallsFor, params: { callsFor } }
	};
};

export function registerCallForHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateCallsFor, createCallsFor);
	recipeState.register(ActionType.DeleteCallsFor, deleteCallsFor);
}
