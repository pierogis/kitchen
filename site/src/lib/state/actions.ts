import type { CallFor, Connection, Flavor, Ingredient, Location, Parameter, Usage } from '@types';
import type { FlatRecipe } from '@recipe';

export enum ActionType {
	CreateIngredient,
	DeleteIngredient,
	CreateFlavor,
	DeleteFlavor,
	CreateUsage,
	DeleteUsage,
	CreateCallFor,
	DeleteCallFor,
	CreateLocation,
	DeleteLocation,
	CreateConnection,
	UpdateConnection,
	DeleteConnection,
	CreateParameter,
	UpdateParameter,
	DeleteParameter
}

type ActionParamsMapper = {
	[ActionType.CreateIngredient]: { ingredient: Ingredient };
	[ActionType.DeleteIngredient]: { uuid: string };
	[ActionType.CreateFlavor]: { flavor: Flavor };
	[ActionType.DeleteFlavor]: { uuid: string };
	[ActionType.CreateUsage]: { usage: Usage };
	[ActionType.DeleteUsage]: { uuid: string };
	[ActionType.CreateCallFor]: { callFor: CallFor };
	[ActionType.DeleteCallFor]: { uuid: string };
	[ActionType.CreateLocation]: { location: Location };
	[ActionType.DeleteLocation]: { uuid: string };
	[ActionType.CreateConnection]: { connection: Connection };
	[ActionType.UpdateConnection]: { connection: Connection };
	[ActionType.DeleteConnection]: { uuid: string };
	[ActionType.CreateParameter]: { parameter: Parameter };
	[ActionType.UpdateParameter]: { parameter: Parameter };
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
