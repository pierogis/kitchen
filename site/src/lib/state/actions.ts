import type { CallFor, Connection, Flavor, Ingredient, Location, Parameter, Usage } from '@types';
import type { FlatRecipe } from '@recipe';

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
	FocusUsage
}

type ActionParamsMapper = {
	[ActionType.CreateIngredients]: { ingredients: Ingredient[] };
	[ActionType.DeleteIngredients]: { uuids: string[] };
	[ActionType.CreateFlavors]: { flavors: Flavor[] };
	[ActionType.DeleteFlavors]: { uuids: string[] };
	[ActionType.CreateUsages]: { usages: Usage[] };
	[ActionType.DeleteUsages]: { uuids: string[] };
	[ActionType.CreateCallsFor]: { callsFor: CallFor[] };
	[ActionType.DeleteCallsFor]: { uuids: string[] };
	[ActionType.CreateLocations]: { locations: Location[] };
	[ActionType.DeleteLocations]: { uuids: string[] };
	[ActionType.CreateConnections]: { connections: Connection[] };
	[ActionType.UpdateConnections]: { connections: Connection[] };
	[ActionType.DeleteConnections]: { uuids: string[] };
	[ActionType.CreateParameters]: { parameters: Parameter[] };
	[ActionType.UpdateParameters]: { parameters: Parameter[] };
	[ActionType.DeleteParameters]: { uuids: string[] };
	[ActionType.FocusUsage]: { uuid: string };
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
