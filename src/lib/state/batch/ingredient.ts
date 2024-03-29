import { get } from 'svelte/store';

import { v4 as uuid } from 'uuid';

import type {
	CallFor,
	Flavor,
	Ingredient,
	Location,
	Usage,
	Coordinates,
	PrepType,
	Prep
} from '$types';

import type { RecipeState } from '$recipe';
import { type Action, ActionType } from '$state/actions';
import { prepPrimitives } from '$lib/common/preps';

export function dispatchIngredientCreationActions(
	recipeState: RecipeState,
	coordinates: Coordinates,
	focusedIngredientUuid: string,
	flavorDescriptions: Pick<Flavor, 'name' | 'directions' | 'type' | 'options'>[],
	prepDescriptions: Pick<Prep<PrepType>, 'type' | 'direction'>[]
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

	const flavors: Flavor[] = flavorDescriptions.map((flavor) => {
		return {
			uuid: uuid(),
			ingredientUuid: ingredient.uuid,
			type: flavor.type,
			name: flavor.name,
			options: flavor.options,
			directions: flavor.directions
		};
	});

	const preps = prepDescriptions.map(({ type, direction }) => {
		const prepUuid = uuid();

		const primitive = prepPrimitives[type];

		const { prep, prepFlavors } = primitive.create(prepUuid, ingredient.uuid, direction);

		prepFlavors.map((flavor) => flavors.push(flavor));

		return prep;
	});

	const flavorsAction: Action<ActionType.CreateFlavors> = {
		type: ActionType.CreateFlavors,
		params: {
			flavors
		}
	};

	const prepsAction: Action<ActionType.CreatePreps> = {
		type: ActionType.CreatePreps,
		params: {
			preps
		}
	};

	recipeState.batchDispatch([
		locationAction,
		flavorsAction,
		prepsAction,
		usageAction,
		callForAction,
		ingredientAction
	]);
}
