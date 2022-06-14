import type {
	CallFor,
	Connection,
	Flavor,
	Ingredient,
	Parameter,
	Shader,
	Location
} from '$lib/common/types';
import type { Action, ActionHandler, ActionType } from '$lib/state/actions';
import { writable, type Readable, derived, type Writable } from 'svelte/store';
import { dispatcher } from '../dispatcher';
import { readableView } from './view';

export interface State {
	recipeUuid: string;
	focusedCallForUuid: string;
	ingredients: Map<string, Ingredient>;
	flavors: Map<string, Flavor>;
	callsFor: Map<string, CallFor>;
	connections: Map<string, Connection>;
	shaders: Map<string, Shader>;
	parameters: Map<string, Parameter>;
	locations: Map<string, Location>;
}

export type ActionableState = {
	[key in keyof State]: Readable<State[key]>;
} & Readable<State> & {
		register: <T extends ActionType, U extends ActionType>(
			type: T,
			handler: ActionHandler<T, U>
		) => number;
		dispatch: <T extends ActionType>(action: Action<T>) => void;
	};

export function actionableState(value: State): ActionableState {
	const store = writable(value);
	const actions = dispatcher(store);

	return {
		subscribe: store.subscribe,

		register: actions.register,
		dispatch: actions.dispatch,

		recipeUuid: derived(store, (currentState) => {
			return currentState.recipeUuid;
		}),
		focusedCallForUuid: derived(store, (currentState) => {
			return currentState.focusedCallForUuid;
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
		})
	};
}
