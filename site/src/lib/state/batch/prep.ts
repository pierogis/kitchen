import { get } from 'svelte/store';

import { v4 as uuid } from 'uuid';

import type { Direction, PrepType } from '@types';

import type { RecipeState } from '@recipe';
import { type Action, ActionType } from '@state/actions';
import { prepPrimitives } from '$lib/common/preps';

export function dispatchAddPrepActions(
	recipeState: RecipeState,
	ingredientUuid: string,
	direction: Direction,
	type: PrepType
) {
	const prepUuid = uuid();
	const { prep, prepFlavors } = prepPrimitives[type].create(prepUuid, ingredientUuid, direction);

	const createPrepsAction: Action<ActionType.CreatePreps> = {
		type: ActionType.CreatePreps,
		params: {
			preps: [prep]
		}
	};
	const createFlavorsAction: Action<ActionType.CreateFlavors> = {
		type: ActionType.CreateFlavors,
		params: {
			flavors: prepFlavors
		}
	};

	recipeState.batchDispatch([createFlavorsAction, createPrepsAction]);
}

export function dispatchUpdatePrepNameActions(
	recipeState: RecipeState,
	prepUuid: string,
	name: string
) {
	const oldPrep = get(recipeState.preps).get(prepUuid);

	if (!oldPrep) throw `prep ${prepUuid} not found`;

	if (oldPrep.name != name) {
		const updatePrepsAction: Action<ActionType.UpdatePreps> = {
			type: ActionType.UpdatePreps,
			params: {
				preps: [{ ...oldPrep, name }]
			}
		};

		recipeState.batchDispatch([updatePrepsAction]);
	}
}

export function dispatchChangePrepTypeActions(
	recipeState: RecipeState,
	prepUuid: string,
	ingredientUuid: string,
	direction: Direction,
	type: PrepType
) {
	// create new flavors

	const prepPrimitive = prepPrimitives[type];
	const { prep, prepFlavors } = prepPrimitive.create(prepUuid, ingredientUuid, direction);

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
		(flavor) => flavor.prepUuid == prep.uuid
	);

	const deleteFlavorsAction: Action<ActionType.DeleteFlavors> = {
		type: ActionType.DeleteFlavors,
		params: {
			flavors: oldFlavors
		}
	};

	recipeState.batchDispatch([createFlavorsAction, prepsAction, deleteFlavorsAction]);
}
