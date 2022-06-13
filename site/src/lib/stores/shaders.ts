import { v4 as uuid } from 'uuid';

import type { FullRecipe, Shader } from '$lib/common/types';
import { writableMap, type WritableMap } from '$lib/common/stores';
import { type Readable, derived } from 'svelte/store';
import { state } from '.';

// export const shaders: WritableMap<string, Shader> = writableMap(new Map());

export function storeShaders(recipe: FullRecipe): Map<string, Shader> {
	return new Map(recipe.shaders.map((shader) => [shader.uuid, shader]));
}

// export function addShader(shader: Omit<Shader, 'uuid'>) {
// 	const newUuid = uuid();

// 	const newShader = { ...shader, uuid: newUuid };

// 	return shaders.add(newUuid, newShader);
// }

export const shaders: Readable<Map<string, Shader>> = derived(state, (currentState) => {
	return currentState.shaders;
});
