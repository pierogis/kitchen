import type { Ingredient, Flavor, CallFor, Location } from '$lib/common/types';
import { ActionType } from './';
import { v4 as uuid } from 'uuid';
import type { WritableState } from '$lib/stores/state';

export const createIngredient = (
	state: WritableState,
	params: {
		ingredient: Omit<Ingredient, 'uuid'>;
		callFor: Omit<CallFor, 'uuid' | 'ingredientUuid'>;
		location: Omit<Location, 'uuid' | 'callForUuid'>;
		flavors: Omit<Flavor, 'uuid' | 'ingredientUuid'>[];
	}
) => {
	let ingredientUuid: string = uuid();
	let callForUuid: string = uuid();
	let locationUuid: string = uuid();
	let flavorUuids: string[] = [];

	state.update((currentState) => {
		const newIngredient: Ingredient = {
			...params.ingredient,
			uuid: ingredientUuid
		};
		currentState.ingredients.set(ingredientUuid, newIngredient);

		params.flavors.forEach((flavor) => {
			const flavorUuid = uuid();
			const newFlavor: Flavor = {
				...flavor,
				uuid: flavorUuid,
				ingredientUuid
			};
			currentState.flavors.set(flavorUuid, newFlavor);

			flavorUuids.push(flavorUuid);
		});

		const newCallFor: CallFor = {
			...params.callFor,
			uuid: callForUuid,
			ingredientUuid
		};
		currentState.callsFor.set(callForUuid, newCallFor);

		const newLocation: Location = {
			...params.location,
			uuid: locationUuid,
			callForUuid
		};
		currentState.locations.set(locationUuid, newLocation);

		return currentState;
	});

	return {
		type: ActionType.DeleteIngredient,
		params: {
			ingredientUuid,
			flavorUuids,
			callForUuid,
			locationUuid
		}
	};
};

let undo = (
	state: WritableState,
	params: {
		callForUuid: string;
		ingredientUuid: string;
		locationUuid: string;
		flavorUuids: string[];
	}
) => {
	state.update((currentState) => {
		currentState.ingredients.delete(params.ingredientUuid);
		currentState.locations.delete(params.locationUuid);
		currentState.callsFor.delete(params.callForUuid);
		params.flavorUuids.forEach((flavorUuid) => {
			currentState.flavors.delete(flavorUuid);
		});

		return currentState;
	});
};
