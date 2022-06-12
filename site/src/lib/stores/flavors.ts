import { v4 as uuid } from 'uuid';

import type { FullRecipe, Flavor } from '$lib/common/types';

import { writableMap, type WritableMap } from '$lib/common/stores';

export const flavors: WritableMap<string, Flavor> = writableMap(new Map());

export function storeFlavors(recipe: FullRecipe) {
	flavors.set(
		new Map(
			recipe.callsFor.reduce<[string, Flavor][]>((previous, callFor) => {
				previous = previous.concat(
					callFor.ingredient.flavors.map((flavor) => [flavor.uuid, flavor])
				);

				return previous;
			}, [])
		)
	);
}

export function addFlavor(flavor: Omit<Flavor, 'uuid'>) {
	const newUuid = uuid();

	const newFlavor = { ...flavor, uuid: newUuid };

	return flavors.add(newUuid, newFlavor);
}
