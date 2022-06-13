import { v4 as uuid } from 'uuid';

import type { FullRecipe, CallFor } from '$lib/common/types';
import { writableMap, type WritableMap } from '$lib/common/stores';
import { state } from '.';
import { type Readable, derived } from 'svelte/store';

// export const callsFor: WritableMap<string, CallFor> = writableMap(new Map());

export function storeCallsFor(recipe: FullRecipe): Map<string, CallFor> {
	return new Map(recipe.callsFor.map((callFor) => [callFor.uuid, callFor]));
}

// export function addCallFor(callFor: Omit<CallFor, 'uuid'>) {
// 	const newUuid = uuid();

// 	const newCallFor = { ...callFor, uuid: newUuid };

// 	return callsFor.add(newUuid, newCallFor);
// }

export const callsFor: Readable<Map<string, CallFor>> = derived(state, (currentState) => {
	return currentState.callsFor;
});
