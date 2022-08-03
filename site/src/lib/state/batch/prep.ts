import { get } from 'svelte/store';

import type { Prep, PrepType } from '@types';

import type { RecipeState } from '@recipe';
import { type Action, ActionType } from '@state/actions';
import { prepPrimitives } from '$lib/common/preps';

export function dispatchChangePrepTypeActions(
	recipeState: RecipeState,
	oldPrep: Prep<PrepType>,
	type: PrepType
) {
	// create new flavors

	const prepPrimitive = prepPrimitives[type];
	const { prep, prepFlavors } = prepPrimitive.create(oldPrep.uuid, oldPrep.ingredientUuid);

	const createFlavorsAction: Action<ActionType.CreateFlavors> = {
		type: ActionType.CreateFlavors,
		params: {
			flavors: prepFlavors
		}
	};

	// change the prep type and uuid map
	const prepsAction: Action<ActionType.UpdatePreps> = {
		type: ActionType.UpdatePreps,
		params: {
			preps: [prep]
		}
	};

	// delete old flavors
	const oldFlavors = Array.from(get(recipeState.flavors).values()).filter(
		(flavor) => flavor.prepUuid == oldPrep.uuid
	);

	const deleteFlavorsAction: Action<ActionType.DeleteFlavors> = {
		type: ActionType.DeleteFlavors,
		params: {
			flavors: oldFlavors
		}
	};

	recipeState.batchDispatch([createFlavorsAction, prepsAction, deleteFlavorsAction]);
}
