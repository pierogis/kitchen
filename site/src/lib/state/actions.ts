import type {
	CallFor,
	Connection,
	Flavor,
	Ingredient,
	Location,
	Parameter
} from '$lib/common/types';
import type { FlatRecipe } from './stores/recipe';

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
	DeleteConnection,
	CreateParameter,
	DeleteParameter
}

type ActionParamsMapper = {
	[ActionType.CreateIngredient]: { ingredient: Ingredient };
	[ActionType.DeleteIngredient]: { uuid: string };
	[ActionType.CreateFlavor]: { flavor: Flavor };
	[ActionType.DeleteFlavor]: { uuid: string };
	[ActionType.CreateCallFor]: { callFor: CallFor };
	[ActionType.DeleteCallFor]: { uuid: string };
	[ActionType.CreateLocation]: { location: Location };
	[ActionType.DeleteLocation]: { uuid: string };
	[ActionType.CreateConnection]: { connection: Connection };
	[ActionType.UpdateConnection]: { connection: Connection };
	[ActionType.DeleteConnection]: { uuid: string };
	[ActionType.CreateParameter]: { parameter: Parameter };
	[ActionType.DeleteParameter]: { uuid: string };
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
