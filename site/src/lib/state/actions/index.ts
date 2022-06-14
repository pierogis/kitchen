import type { CallFor, Flavor, Ingredient, Location } from '$lib/common/types';
import type { Writable } from 'svelte/store';
import type { State } from '../stores/state';
import { createIngredient, deleteIngredient } from './ingredient';

export enum ActionType {
	CreateIngredient,
	DeleteIngredient
}

type ActionParamsMapper = {
	[ActionType.CreateIngredient]: {
		ingredient: Omit<Ingredient, 'uuid'> & Partial<Pick<Ingredient, 'uuid'>>;
		callFor: Omit<CallFor, 'uuid' | 'ingredientUuid'> &
			Partial<Pick<CallFor, 'uuid' | 'ingredientUuid'>>;
		location: Omit<Location, 'uuid' | 'callForUuid'> &
			Partial<Pick<Location, 'uuid' | 'callForUuid'>>;
		flavors: (Omit<Flavor, 'uuid' | 'ingredientUuid'> &
			Partial<Pick<Flavor, 'uuid' | 'ingredientUuid'>>)[];
	};
	[ActionType.DeleteIngredient]: {
		ingredient: Ingredient;
		callFor: CallFor;
		location: Location;
		flavors: Flavor[];
	};
};

export type ActionParams<T> = T extends ActionType ? ActionParamsMapper[T] : never;

export interface Action<T extends ActionType> {
	type: T;
	params: ActionParams<T>;
}

export type ActionHandler<E extends ActionType, U extends ActionType> = (
	state: State,
	params: ActionParams<E>
) => { state: State; undoAction: Action<U> };
