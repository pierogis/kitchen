import type { Flavor } from '$lib/common/types';
import { ActionType, type ActionHandler } from '$lib/state/actions';
import { v4 as uuid } from 'uuid';

export const createIngredient: ActionHandler<
	ActionType.CreateIngredient,
	ActionType.DeleteIngredient
> = (state, params) => {
	const ingredient = { uuid: params.ingredient.uuid || uuid(), ...params.ingredient };
	const flavors: Flavor[] = params.flavors.map((flavor) => {
		return {
			uuid: flavor.uuid || uuid(),
			ingredientUuid: ingredient.uuid,
			...flavor
		};
	});
	const callFor = {
		uuid: params.callFor.uuid || uuid(),
		ingredientUuid: ingredient.uuid,
		...params.callFor
	};
	const location = {
		uuid: params.location.uuid || uuid(),
		callForUuid: callFor.uuid,
		...params.location
	};

	state.ingredients.set(ingredient.uuid, ingredient);

	flavors.forEach((flavor) => {
		state.flavors.set(flavor.uuid, flavor);
	});

	state.callsFor.set(callFor.uuid, callFor);

	state.locations.set(location.uuid, location);

	return {
		state,
		undoAction: {
			type: ActionType.DeleteIngredient,
			params: {
				ingredient,
				flavors,
				callFor,
				location
			}
		}
	};
};

export const deleteIngredient: ActionHandler<
	ActionType.DeleteIngredient,
	ActionType.CreateIngredient
> = (state, params) => {
	// delete ingredient
	state.ingredients.delete(params.ingredient.uuid);

	// delete flavors
	params.flavors.map((flavor) => state.flavors.delete(flavor.uuid));

	// delete location
	state.locations.delete(params.location.uuid);

	// delete callFor
	state.callsFor.delete(params.callFor.uuid);

	return {
		state,
		undoAction: { type: ActionType.CreateIngredient, params }
	};
};
