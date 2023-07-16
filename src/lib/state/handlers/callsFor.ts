import { type ActionHandler, ActionType } from '$state/actions';
import type { RecipeState } from '$recipe';

import { createEntities, deleteEntities } from './common';

const createCallsFor: ActionHandler<ActionType.CreateCallsFor, ActionType.DeleteCallsFor> = (
	stores,
	params
) => {
	const callsFor = createEntities(stores.callsFor, params.callsFor);

	return {
		type: ActionType.DeleteCallsFor,
		params: {
			callsFor
		}
	};
};

const deleteCallsFor: ActionHandler<ActionType.DeleteCallsFor, ActionType.CreateCallsFor> = (
	stores,
	params
) => {
	deleteEntities(stores.callsFor, params.callsFor);

	return {
		type: ActionType.CreateCallsFor,
		params: { callsFor: params.callsFor }
	};
};

export function registerCallForHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateCallsFor, createCallsFor);
	recipeState.register(ActionType.DeleteCallsFor, deleteCallsFor);
}
