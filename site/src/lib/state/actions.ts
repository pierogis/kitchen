import type {
	CallFor,
	Connection,
	Flavor,
	FlavorType,
	Ingredient,
	Location,
	Parameter,
	Prep,
	PrepType,
	Usage
} from '@types';
import type { FlatRecipe } from '@recipe';
import type { Writable } from 'svelte/store';

export enum ActionType {
	CreateIngredients,
	DeleteIngredients,
	CreateFlavors,
	DeleteFlavors,
	CreateUsages,
	DeleteUsages,
	CreateCallsFor,
	DeleteCallsFor,
	CreateLocations,
	DeleteLocations,
	CreateConnections,
	UpdateConnections,
	DeleteConnections,
	CreateParameters,
	UpdateParameters,
	DeleteParameters,
	CreatePreps,
	DeletePreps,
	FocusUsage
}

type ActionParamsMapper = {
	[ActionType.CreateIngredients]: { ingredients: Ingredient[] };
	[ActionType.DeleteIngredients]: { ingredients: Ingredient[] };
	[ActionType.CreateFlavors]: { flavors: Flavor[] };
	[ActionType.DeleteFlavors]: { flavors: Flavor[] };
	[ActionType.CreateUsages]: { usages: Usage[] };
	[ActionType.DeleteUsages]: { usages: Usage[] };
	[ActionType.CreateCallsFor]: { callsFor: CallFor[] };
	[ActionType.DeleteCallsFor]: { callsFor: CallFor[] };
	[ActionType.CreateLocations]: { locations: Location[] };
	[ActionType.DeleteLocations]: { locations: Location[] };
	[ActionType.CreateConnections]: { connections: Connection[] };
	[ActionType.UpdateConnections]: { connections: Connection[] };
	[ActionType.DeleteConnections]: { connections: Connection[] };
	[ActionType.CreateParameters]: { parameters: Parameter<FlavorType>[] };
	[ActionType.UpdateParameters]: { parameters: Parameter<FlavorType>[] };
	[ActionType.DeleteParameters]: { parameters: Parameter<FlavorType>[] };
	[ActionType.CreatePreps]: { preps: Prep<PrepType>[] };
	[ActionType.DeletePreps]: { preps: Prep<PrepType>[] };
	[ActionType.FocusUsage]: { usageUuid: string };
};

export type ActionParams<T> = T extends ActionType ? ActionParamsMapper[T] : never;

export interface Action<T extends ActionType> {
	type: T;
	params: ActionParams<T>;
}

export type ActionHandler<E extends ActionType, U extends ActionType> = (
	stores: {
		[key in keyof FlatRecipe]: Writable<FlatRecipe[key]>;
	},
	params: ActionParams<E>
) => Action<U>;
