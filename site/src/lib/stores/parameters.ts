import { type Writable, writable } from 'svelte/store';
import type { FullRecipe, Parameter } from '$lib/common/types';

export function flattenParameters(recipe: FullRecipe): Map<number, Parameter> {
	const parameters: Map<number, Parameter> = new Map();

	recipe.parameters.forEach((parameter) => {
		parameters.set(parameter.flavorId, parameter);
	});

	return parameters;
}

export const parameters: Writable<Map<number, Parameter>> = writable(new Map());
