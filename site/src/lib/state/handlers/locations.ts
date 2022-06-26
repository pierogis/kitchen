import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';

const createLocation: ActionHandler<ActionType.CreateLocation, ActionType.DeleteLocation> = (
	state,
	params
) => {
	state.locations.set(params.location.uuid, params.location);

	return {
		state,
		undoAction: {
			type: ActionType.DeleteLocation,
			params: {
				uuid: params.location.uuid
			}
		}
	};
};

const deleteLocation: ActionHandler<ActionType.DeleteLocation, ActionType.CreateLocation> = (
	state,
	params
) => {
	// delete location
	const location = state.locations.get(params.uuid);
	if (!location) throw `Location ${params.uuid} does not exist`;
	state.locations.delete(params.uuid);

	return {
		state,
		undoAction: { type: ActionType.CreateLocation, params: { location } }
	};
};

export function registerLocationHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateLocation, createLocation);
	recipeState.register(ActionType.DeleteLocation, deleteLocation);
}
