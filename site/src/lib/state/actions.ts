import type { CallFor, Connection, Flavor, Ingredient, Location } from '$lib/common/types';
import type { FlatRecipe } from './stores/recipe';

export enum ActionType {
	CreateIngredient,
	DeleteIngredient,
	CreateConnection,
	UpdateConnection,
	DeleteConnection
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
	[ActionType.CreateConnection]: Connection;
	[ActionType.UpdateConnection]: Connection;
	[ActionType.DeleteConnection]: {
		connectionUuid: string;
	};
};

export type ActionParams<T> = T extends ActionType ? ActionParamsMapper[T] : never;

export interface Action<T extends ActionType> {
	type: T;
	params: ActionParams<T>;
}

export type ActionHandler<E extends ActionType, U extends ActionType> = (
	state: FlatRecipe,
	params: ActionParams<E>
) => { state: FlatRecipe; undoAction: Action<U> };
