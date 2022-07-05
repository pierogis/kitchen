import { writable, type Readable, get } from 'svelte/store';

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
	// const store = writable(recipe);

	const recipeUuid = writable(recipe.recipeUuid);
	const focusedUsageUuid = writable(recipe.focusedUsageUuid);
	const ingredients = writable(recipe.ingredients);
	const flavors = writable(recipe.flavors);
	const callsFor = writable(recipe.callsFor);
	const connections = writable(recipe.connections);
	const shaders = writable(recipe.shaders);
	const parameters = writable(recipe.parameters);
	const locations = writable(recipe.locations);
	const usages = writable(recipe.usages);

	const stores = {
		recipeUuid,
		focusedUsageUuid,
		ingredients,
		flavors,
		callsFor,
		connections,
		shaders,
		parameters,
		locations,
		usages
	};

	const actionsDispatcher = dispatcher(stores);

	const store = writable(recipe);

	function dispatch(action: Action<ActionType>) {
		actionsDispatcher.dispatch(action);
		store.set({
			recipeUuid: get(recipeUuid),
			focusedUsageUuid: get(focusedUsageUuid),
			ingredients: get(ingredients),
			flavors: get(flavors),
			callsFor: get(callsFor),
			connections: get(connections),
			shaders: get(shaders),
			parameters: get(parameters),
			locations: get(locations),
			usages: get(usages)
		});
	}

	function batchDispatch(actions: Action<ActionType>[]) {
		actionsDispatcher.batchDispatch(actions);
		store.set({
			recipeUuid: get(recipeUuid),
			focusedUsageUuid: get(focusedUsageUuid),
			ingredients: get(ingredients),
			flavors: get(flavors),
			callsFor: get(callsFor),
			connections: get(connections),
			shaders: get(shaders),
			parameters: get(parameters),
			locations: get(locations),
			usages: get(usages)
		});
	}

	return {
		subscribe: store.subscribe,
		register: actionsDispatcher.register,
		dispatch: dispatch,
		batchDispatch: batchDispatch,

		...stores
	};
}
