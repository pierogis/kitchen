import { type ActionHandler, ActionType } from '$state/actions';
import type { RecipeState } from '$recipe';
import type { Location } from '$types';
import { createEntities, deleteEntities } from './common';
import { get } from 'svelte/store';

const createLocations: ActionHandler<ActionType.CreateLocations, ActionType.DeleteLocations> = (
	stores,
	params
) => {
	const locations = createEntities(stores.locations, params.locations);

	return {
		type: ActionType.DeleteLocations,
		params: {
			locations
		}
	};
};

const deleteLocations: ActionHandler<ActionType.DeleteLocations, ActionType.CreateLocations> = (
	stores,
	params
) => {
	deleteEntities(stores.locations, params.locations);

	return {
		type: ActionType.CreateLocations,
		params: {
			locations: params.locations
		}
	};
};

const deleteCallsFor: ActionHandler<ActionType.DeleteCallsFor, ActionType.CreateLocations> = (
	stores,
	params
) => {
	const currentLocations = get(stores.locations);

	const oldLocations = params.callsFor.flatMap((callFor) => {
		const location: Location | undefined = Array.from(currentLocations.values()).find(
			(location) => location.callForUuid == callFor.uuid
		);
		return location ? [location] : [];
	});

	return {
		type: ActionType.CreateLocations,
		params: { locations: oldLocations }
	};
};

export function registerLocationHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateLocations, createLocations);
	recipeState.register(ActionType.DeleteLocations, deleteLocations);
	recipeState.register(ActionType.DeleteCallsFor, deleteCallsFor);
}
