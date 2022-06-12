import { v4 as uuid } from 'uuid';

import type { FullRecipe, Shader } from '$lib/common/types';
import { writableMap, type WritableMap } from '$lib/common/stores';

export const shaders: WritableMap<string, Shader> = writableMap(new Map());

export function storeShaders(recipe: FullRecipe) {
	shaders.set(new Map(recipe.shaders.map((shader) => [shader.uuid, shader])));
}

export function addShader(shader: Omit<Shader, 'uuid'>) {
	const newUuid = uuid();

	const newShader = { ...shader, uuid: newUuid };

	return shaders.add(newUuid, newShader);
}
