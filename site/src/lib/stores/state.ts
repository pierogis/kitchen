import type {
	CallFor,
	Connection,
	Flavor,
	Ingredient,
	Parameter,
	Shader,
	Location
} from '$lib/common/types';
import { writable, type Readable, derived, type Writable } from 'svelte/store';

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

export type WritableState = {
	[key in keyof State]: Readable<State[key]>;
} & Writable<State>;

export function writableState(value: any): WritableState {
	const store = writable(value);

	return {
		set: store.set,
		update: store.update,
		subscribe: store.subscribe,

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
