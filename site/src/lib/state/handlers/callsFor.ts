import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';

import { createEntities, deleteEntities } from './common';

const createCallsFor: ActionHandler<ActionType.CreateCallsFor, ActionType.DeleteCallsFor> = (
	stores,
	params
) => {
	const uuids = createEntities(stores.callsFor, params.callsFor);

	return {
		type: ActionType.DeleteCallsFor,
		params: {
			uuids
		}
	};
};

const deleteCallsFor: ActionHandler<ActionType.DeleteCallsFor, ActionType.CreateCallsFor> = (
	stores,
	params
) => {
	const deletedCallsFor = deleteEntities(stores.callsFor, params.uuids);

	return {
		type: ActionType.CreateCallsFor,
		params: { callsFor: deletedCallsFor }
	};
};

export function registerCallForHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateCallsFor, createCallsFor);
	recipeState.register(ActionType.DeleteCallsFor, deleteCallsFor);
}
