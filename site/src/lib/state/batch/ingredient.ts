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

export function dispatchIngredientCreationActions(
	recipeState: RecipeState,
	coordinates: Coordinates,
	focusedIngredientUuid: string
) {
	const ingredient: Ingredient = {
		uuid: uuid(),
		name: 'default',
		parentIngredientUuid: focusedIngredientUuid
	};
	const ingredientAction: Action<ActionType.CreateIngredients> = {
		type: ActionType.CreateIngredients,
		params: {
			ingredients: [ingredient]
		}
	};

	const usage: Usage = {
		uuid: uuid(),
		ingredientUuid: ingredient.uuid,
		parentUsageUuid: get(recipeState.focusedUsageUuid)
	};
	const usageAction: Action<ActionType.CreateUsages> = {
		type: ActionType.CreateUsages,
		params: {
			usages: [usage]
		}
	};

	const callFor: CallFor = {
		uuid: uuid(),
		recipeUuid: get(recipeState.recipeUuid),
		usageUuid: usage.uuid
	};
	const callForAction: Action<ActionType.CreateCallsFor> = {
		type: ActionType.CreateCallsFor,
		params: {
			callsFor: [callFor]
		}
	};

	const location: Location = { uuid: uuid(), callForUuid: callFor.uuid, ...coordinates };
	const locationAction: Action<ActionType.CreateLocations> = {
		type: ActionType.CreateLocations,
		params: {
			locations: [location]
		}
	};

	const flavors: Flavor[] = [
		{
			uuid: uuid(),
			ingredientUuid: ingredient.uuid,
			type: FlavorType.Text,
			name: 'text',
			options: null,
			directions: [Direction.Out]
		}
	];
	const flavorAction: Action<ActionType.CreateFlavors> = {
		type: ActionType.CreateFlavors,
		params: {
			flavors
		}
	};

	recipeState.batchDispatch([
		locationAction,
		flavorAction,
		usageAction,
		callForAction,
		ingredientAction
	]);
}
