import { writable, type Readable, derived } from 'svelte/store';

import type {
	CallFor,
	Connection,
	Flavor,
	Ingredient,
	Parameter,
	Shader,
	Location,
	Usage
} from '@types';

import type { Action, ActionHandler, ActionType } from '@state/actions';
import { dispatcher } from '@state/dispatcher';

export interface FlatRecipe {
	recipeUuid: string;
	focusedIngredientUuid: string;
	focusedUsageUuid: string;
	ingredients: Map<string, Ingredient>;
	flavors: Map<string, Flavor>;
	callsFor: Map<string, CallFor>;
	connections: Map<string, Connection>;
	shaders: Map<string, Shader>;
	parameters: Map<string, Parameter>;
	locations: Map<string, Location>;
	usages: Map<string, Usage>;
}

export type RecipeState = {
	[key in keyof FlatRecipe]: Readable<FlatRecipe[key]>;
} & Readable<FlatRecipe> & {
		register: <T extends ActionType, U extends ActionType>(
			type: T,
			handler: ActionHandler<T, U>
		) => number;
		dispatch: <T extends ActionType>(action: Action<T>) => void;
		batchDispatch: <T extends ActionType>(actions: Action<T>[]) => void;
	};

export const recipeStateContextKey = 'recipe';

export function createRecipeState(recipe: FlatRecipe): RecipeState {
	// update all at once
	// subscribe to all at once
	// subscribe to just 1
	const store = writable(recipe);

	const actionsDispatcher = dispatcher(store);

	return {
		subscribe: store.subscribe,

		register: actionsDispatcher.register,
		dispatch: actionsDispatcher.dispatch,
		batchDispatch: actionsDispatcher.batchDispatch,

		// ...stores
		recipeUuid: derived(store, (currentState) => {
			return currentState.recipeUuid;
		}),
		focusedIngredientUuid: derived(store, (currentState) => {
			return currentState.focusedIngredientUuid;
		}),
		focusedUsageUuid: derived(store, (currentState) => {
			return currentState.focusedUsageUuid;
		}),
		ingredients: derived(store, (currentState) => {
			return currentState.ingredients;
		}),
		flavors: derived(store, (currentState) => {
			return currentState.flavors;
		}),
		callsFor: derived(store, (currentState) => {
			return currentState.callsFor;
		}),
		connections: derived(store, (currentState) => {
			return currentState.connections;
		}),
		shaders: derived(store, (currentState) => {
			return currentState.shaders;
		}),
		parameters: derived(store, (currentState) => {
			return currentState.parameters;
		}),
		locations: derived(store, (currentState) => {
			return currentState.locations;
		}),
		usages: derived(store, (currentState) => {
			return currentState.usages;
		})
	};
}
