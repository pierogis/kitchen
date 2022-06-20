import { get } from 'svelte/store';

import type { Ingredient, CallFor, Flavor, Location } from '@types';

import { type Action, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';

export function dispatchDeleteCallForActions(recipeState: RecipeState, callFor: CallFor) {
	const callForAction: Action<ActionType.DeleteCallFor> = {
		type: ActionType.DeleteCallFor,
		params: { uuid: callFor.uuid }
	};
	const actions: Action<ActionType>[] = [callForAction];

	const location: Location | undefined = Array.from(get(recipeState.locations).values()).find(
		(location) => location.callForUuid == callFor.uuid
	);
	if (location) {
		const locationAction: Action<ActionType.DeleteLocation> = {
			type: ActionType.DeleteLocation,
			params: {
				uuid: location.uuid
			}
		};

		actions.push(locationAction);
	}

	// location
	const ingredient: Ingredient | undefined = Array.from(get(recipeState.ingredients).values()).find(
		(ingredient) => ingredient.uuid == callFor.ingredientUuid
	);

	if (ingredient) {
		const callsFor: CallFor[] = Array.from(get(recipeState.callsFor).values()).filter(
			(callFor) => ingredient.uuid == callFor.ingredientUuid
		);

		if (callsFor.length <= 1) {
			const ingredientAction: Action<ActionType.DeleteIngredient> = {
				type: ActionType.DeleteIngredient,
				params: {
					uuid: ingredient.uuid
				}
			};

			actions.push(ingredientAction);

			const flavors: Flavor[] = Array.from(get(recipeState.flavors).values()).filter(
				(flavor) => ingredient.uuid == flavor.ingredientUuid
			);

			flavors.map((flavor) => {
				const flavorAction: Action<ActionType.DeleteFlavor> = {
					type: ActionType.DeleteFlavor,
					params: {
						uuid: flavor.uuid
					}
				};
				actions.push(flavorAction);
			});
		}
	}

	recipeState.batchDispatch(actions);
}
