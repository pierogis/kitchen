import type { FlavorType } from '@types';

import type { RecipeState } from '@recipe';
import { type Action, ActionType } from '@state/actions';
import { get } from 'svelte/store';

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
