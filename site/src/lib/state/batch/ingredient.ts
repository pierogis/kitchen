import {
	Direction,
	FlavorType,
	type CallFor,
	type Flavor,
	type Ingredient,
	type Location
} from '$lib/common/types';
import { type Action, ActionType } from '../actions';
import type { Coordinates } from '../stores/view';

import { v4 as uuid } from 'uuid';
import type { RecipeState } from '../stores/recipe';
import { get } from 'svelte/store';

export function dispatchCreateIngredientActions(
	recipeState: RecipeState,
	coordinates: Coordinates
) {
	const ingredient: Ingredient = {
		uuid: uuid(),
		name: 'default'
	};
	const ingredientAction: Action<ActionType.CreateIngredient> = {
		type: ActionType.CreateIngredient,
		params: {
			ingredient
		}
	};

	const callFor: CallFor = {
		uuid: uuid(),
		recipeUuid: get(recipeState.recipeUuid),
		ingredientUuid: ingredient.uuid,
		parentCallForUuid: get(recipeState.focusedCallForUuid)
	};
	const callForAction: Action<ActionType.CreateCallFor> = {
		type: ActionType.CreateCallFor,
		params: {
			callFor
		}
	};

	const location: Location = { uuid: uuid(), callForUuid: callFor.uuid, ...coordinates };
	const locationAction: Action<ActionType.CreateLocation> = {
		type: ActionType.CreateLocation,
		params: {
			location
		}
	};

	const flavor: Flavor = {
		uuid: uuid(),
		ingredientUuid: ingredient.uuid,
		type: FlavorType.Text,
		name: 'text',
		options: null,
		directions: [Direction.Out]
	};
	const flavorAction: Action<ActionType.CreateFlavor> = {
		type: ActionType.CreateFlavor,
		params: {
			flavor
		}
	};

	recipeState.batchDispatch([ingredientAction, callForAction, flavorAction, locationAction]);
}
