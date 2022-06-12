import { v4 as uuid } from 'uuid';

import type { FullRecipe } from '$lib/common/types';
import type { Location } from '$lib/ingredients';
import { writableMap, type WritableMap } from '$lib/common/stores';

export const locations: WritableMap<string, Location> = writableMap(new Map());

export function storeLocations(recipe: FullRecipe) {
	locations.set(
		new Map(recipe.callsFor.map((callFor) => [callFor.location.uuid, callFor.location]))
	);
}

export function addLocation(location: Omit<Location, 'uuid'>) {
	const newUuid = uuid();

	const newLocation = { ...location, uuid: newUuid };

	return locations.add(newUuid, newLocation);
}
