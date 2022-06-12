import { v4 as uuid } from 'uuid';

import type { FullRecipe } from '$lib/common/types';
import { writableMap, type WritableMap } from '$lib/common/stores';
import type { CallFor } from '$lib/ingredients';

export const callsFor: WritableMap<string, CallFor> = writableMap(new Map());

export function storeCallsFor(recipe: FullRecipe) {
	callsFor.set(new Map(recipe.callsFor.map((callFor) => [callFor.uuid, callFor])));
}

export function addCallFor(callFor: Omit<CallFor, 'uuid'>) {
	const newUuid = uuid();

	const newCallFor = { ...callFor, uuid: newUuid };

	return callsFor.add(newUuid, newCallFor);
}
