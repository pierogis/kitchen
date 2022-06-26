import { get } from 'svelte/store';

import { v4 as uuid } from 'uuid';

import {
	Direction,
	FlavorType,
	type CallFor,
	type Flavor,
	type Ingredient,
	type Location,
	type Usage,
	type Coordinates
} from '@types';

import type { RecipeState } from '@recipe';
import { type Action, ActionType } from '@state/actions';

export function dispatchCreateIngredientActions(
	recipeState: RecipeState,
	coordinates: Coordinates
) {
	const ingredient: Ingredient = {
		uuid: uuid(),
		name: 'default',
		parentIngredientUuid: get(recipeState.focusedIngredientUuid)
	};
	const ingredientAction: Action<ActionType.CreateIngredient> = {
		type: ActionType.CreateIngredient,
		params: {
			ingredient
		}
	};

	const usage: Usage = {
		uuid: uuid(),
		ingredientUuid: ingredient.uuid,
		parentUsageUuid: get(recipeState.focusedUsageUuid)
	};
	const usageAction: Action<ActionType.CreateUsage> = {
		type: ActionType.CreateUsage,
		params: {
			usage
		}
	};

	const callFor: CallFor = {
		uuid: uuid(),
		recipeUuid: get(recipeState.recipeUuid),
		usageUuid: usage.uuid
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

	recipeState.batchDispatch([
		ingredientAction,
		usageAction,
		callForAction,
		flavorAction,
		locationAction
	]);
}
