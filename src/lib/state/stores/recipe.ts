import { writable, type Readable, get } from 'svelte/store';

import type {
	CallFor,
	Connection,
	Flavor,
	Ingredient,
	Parameter,
	Shader,
	Location,
	Usage,
	Prep,
	PrepType,
	FlavorType
} from '$types';

import type { Action, ActionHandler, ActionType } from '$state/actions';
import { dispatcher } from '$state/dispatcher';

export interface FlatRecipe {
	recipeUuid: string;
	mainCallForUuid: string;
	focusedUsageUuid: string;
	ingredients: Map<string, Ingredient>;
	flavors: Map<string, Flavor>;
	callsFor: Map<string, CallFor>;
	connections: Map<string, Connection>;
	shaders: Map<string, Shader>;
	parameters: Map<string, Parameter<FlavorType>>;
	locations: Map<string, Location>;
	usages: Map<string, Usage>;
	preps: Map<string, Prep<PrepType>>;
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
	const recipeUuid = writable(recipe.recipeUuid);
	const mainCallForUuid = writable(recipe.mainCallForUuid);
	const focusedUsageUuid = writable(recipe.focusedUsageUuid);
	const ingredients = writable(recipe.ingredients);
	const flavors = writable(recipe.flavors);
	const callsFor = writable(recipe.callsFor);
	const connections = writable(recipe.connections);
	const shaders = writable(recipe.shaders);
	const parameters = writable(recipe.parameters);
	const locations = writable(recipe.locations);
	const usages = writable(recipe.usages);
	const preps = writable(recipe.preps);

	const stores = {
		recipeUuid,
		mainCallForUuid,
		focusedUsageUuid,
		ingredients,
		flavors,
		callsFor,
		connections,
		shaders,
		parameters,
		locations,
		usages,
		preps
	};

	const actionsDispatcher = dispatcher(stores);

	const store = writable(recipe);

	function dispatch(action: Action<ActionType>) {
		actionsDispatcher.dispatch(action);
		store.set({
			recipeUuid: get(recipeUuid),
			mainCallForUuid: get(mainCallForUuid),
			focusedUsageUuid: get(focusedUsageUuid),
			ingredients: get(ingredients),
			flavors: get(flavors),
			callsFor: get(callsFor),
			connections: get(connections),
			shaders: get(shaders),
			parameters: get(parameters),
			locations: get(locations),
			usages: get(usages),
			preps: get(preps)
		});
	}

	function batchDispatch(actions: Action<ActionType>[]) {
		actionsDispatcher.batchDispatch(actions);
		store.set({
			recipeUuid: get(recipeUuid),
			mainCallForUuid: get(mainCallForUuid),
			focusedUsageUuid: get(focusedUsageUuid),
			ingredients: get(ingredients),
			flavors: get(flavors),
			callsFor: get(callsFor),
			connections: get(connections),
			shaders: get(shaders),
			parameters: get(parameters),
			locations: get(locations),
			usages: get(usages),
			preps: get(preps)
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
