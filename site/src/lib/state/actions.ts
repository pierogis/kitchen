import type {
	CallFor,
	Connection,
	Flavor,
	FlavorType,
	Ingredient,
	Location
} from '$lib/common/types';
import type { FlatRecipe } from './stores/recipe';
import type { Coordinates } from './stores/view';

export enum ActionType {
	CreateIngredient,
	DeleteIngredient,
	CreateFlavor,
	DeleteFlavor,
	CreateCallFor,
	DeleteCallFor,
	CreateLocation,
	DeleteLocation,
	CreateConnection,
	UpdateConnection,
	DeleteConnection
}

type ActionParamsMapper = {
	[ActionType.CreateIngredient]: {
		ingredient: Ingredient;
	};
	[ActionType.DeleteIngredient]: {
		uuid: string;
	};
	[ActionType.CreateFlavor]: {
		flavor: Flavor;
	};
	[ActionType.DeleteFlavor]: {
		uuid: string;
	};
	[ActionType.CreateCallFor]: {
		callFor: CallFor;
	};
	[ActionType.DeleteCallFor]: {
		uuid: string;
	};
	[ActionType.CreateLocation]: {
		location: Location;
	};
	[ActionType.DeleteLocation]: {
		uuid: string;
	};
	[ActionType.CreateConnection]: Connection;
	[ActionType.UpdateConnection]: Connection;
	[ActionType.DeleteConnection]: {
		uuid: string;
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
