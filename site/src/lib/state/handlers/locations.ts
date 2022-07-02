import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';

const createLocations: ActionHandler<ActionType.CreateLocations, ActionType.DeleteLocations> = (
	state,
	params
) => {
	const uuids = params.locations.map((location) => {
		state.locations.set(location.uuid, location);

		return location.uuid;
	});

	return {
		state,
		undoAction: {
			type: ActionType.DeleteLocations,
			params: {
				uuids
			}
		}
	};
};

const deleteLocations: ActionHandler<ActionType.DeleteLocations, ActionType.CreateLocations> = (
	state,
	params
) => {
	const locations = params.uuids.map((uuid) => {
		const location = state.locations.get(uuid);
		if (!location) throw `location ${uuid} does not exist`;

		// delete location
		state.locations.delete(uuid);
		return location;
	});

	return {
		state,
		undoAction: { type: ActionType.CreateLocations, params: { locations } }
	};
};

export function registerLocationHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateLocations, createLocations);
	recipeState.register(ActionType.DeleteLocations, deleteLocations);
}
