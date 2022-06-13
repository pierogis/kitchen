import { v4 as uuid } from 'uuid';

import type { FullRecipe, Parameter } from '$lib/common/types';
import { writableMap, type WritableMap } from '$lib/common/stores';
import { type Readable, derived } from 'svelte/store';
import { state } from '.';

// export const parameters: WritableMap<string, Parameter> = writableMap(new Map());

export function storeParameters(recipe: FullRecipe): Map<string, Parameter> {
	return new Map(recipe.parameters.map((parameter) => [parameter.uuid, parameter]));
}

// export function addParameter(parameter: Omit<Parameter, 'uuid'>) {
// 	const newUuid = uuid();

// 	const newParameter = { ...parameter, uuid: newUuid };

// 	return parameters.add(newUuid, newParameter);
// }

export const parameters: Readable<Map<string, Parameter>> = derived(state, (currentState) => {
	return currentState.parameters;
});
