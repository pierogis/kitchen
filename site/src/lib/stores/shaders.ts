import { type Writable, writable } from 'svelte/store';
import type { FullRecipe, Shader } from '$lib/common/types';

export function flattenShaders(recipe: FullRecipe): Map<number, Shader> {
	const shaders: Map<number, Shader> = new Map();

	recipe.shaders.forEach((shader) => {
		shaders.set(shader.id, shader);
	});

	return shaders;
}

export const shaders: Writable<Map<number, Shader>> = writable(new Map());
