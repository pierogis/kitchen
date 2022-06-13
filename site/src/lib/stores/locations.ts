import { v4 as uuid } from 'uuid';

import type { FullRecipe, Location } from '$lib/common/types';

import { writableMap, type WritableMap } from '$lib/common/stores';
import { derived, type Readable } from 'svelte/store';
import { state } from '.';

// export const locations: WritableMap<string, Location> = writableMap(new Map());

export function storeLocations(recipe: FullRecipe): Map<string, Location> {
	return new Map(recipe.callsFor.map((callFor) => [callFor.location.uuid, callFor.location]));
}

// export function addLocation(location: Omit<Location, 'uuid'>) {
// 	const newUuid = uuid();

// 	const newLocation = { ...location, uuid: newUuid };

// 	return locations.add(newUuid, newLocation);
// }

export const locations: Readable<Map<string, Location>> = derived(state, (currentState) => {
	return currentState.locations;
});
