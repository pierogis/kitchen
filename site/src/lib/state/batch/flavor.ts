import { get } from 'svelte/store';

import { v4 as uuid } from 'uuid';

import type { Flavor, FlavorType, Direction } from '@types';
import type { RecipeState } from '@recipe';
import { type Action, ActionType } from '@state/actions';

export function dispatchAddFlavorActions(
	recipeState: RecipeState,
	ingredientUuid: string,
	direction: Direction,
	type: FlavorType,
	name: string
) {
	const flavorUuid = uuid();
	const flavor: Flavor = {
		uuid: flavorUuid,
		ingredientUuid,
		type,
		name: name,
		options: null,
		directions: [direction]
	};

	const createFlavorsAction: Action<ActionType.CreateFlavors> = {
		type: ActionType.CreateFlavors,
		params: {
			flavors: [flavor]
		}
	};

	recipeState.batchDispatch([createFlavorsAction]);
}

export function dispatchUpdateFlavorNameActions(
	recipeState: RecipeState,
	flavorUuid: string,
	name: string
) {
	const oldFlavor = get(recipeState.flavors).get(flavorUuid);

	if (!oldFlavor) throw `flavor ${flavorUuid} not found`;

	if (oldFlavor.name != name) {
		const updateFlavorsAction: Action<ActionType.UpdateFlavors> = {
			type: ActionType.UpdateFlavors,
			params: {
				flavors: [{ ...oldFlavor, name }]
			}
		};

		recipeState.batchDispatch([updateFlavorsAction]);
	}
}

export function dispatchUpdateFlavorTypeActions(
	recipeState: RecipeState,
	flavorUuid: string,
	type: FlavorType
) {
	const oldFlavor = get(recipeState.flavors).get(flavorUuid);

	if (!oldFlavor) throw `flavor ${flavorUuid} not found`;

	// delete parameter too

	if (oldFlavor.type != type) {
		const updateFlavorsAction: Action<ActionType.UpdateFlavors> = {
			type: ActionType.UpdateFlavors,
			params: {
				flavors: [{ ...oldFlavor, type }]
			}
		};

		recipeState.batchDispatch([updateFlavorsAction]);
	}
}
