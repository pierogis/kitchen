import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';
import { createEntities, deleteEntities } from './common';

const createLocations: ActionHandler<ActionType.CreateLocations, ActionType.DeleteLocations> = (
	stores,
	params
) => {
	const uuids = createEntities(stores.locations, params.locations);

	return {
		type: ActionType.DeleteLocations,
		params: {
			uuids
		}
	};
};

const deleteLocations: ActionHandler<ActionType.DeleteLocations, ActionType.CreateLocations> = (
	stores,
	params
) => {
	const locations = deleteEntities(stores.locations, params.uuids);

	return {
		type: ActionType.CreateLocations,
		params: {
			locations
		}
	};
};

export function registerLocationHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateLocations, createLocations);
	recipeState.register(ActionType.DeleteLocations, deleteLocations);
}
