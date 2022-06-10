import { type Writable, writable } from 'svelte/store';
import type { FullRecipe } from '$lib/common/types';
import type { Flavor } from '$lib/flavors';
import type { FullIngredient } from '$lib/ingredients';

export function flattenFlavors(recipe: FullRecipe): Map<number, Flavor> {
	const flavors: Map<number, Flavor> = new Map();

	function getFlavorsFromIngredient(ingredient: FullIngredient) {
		ingredient.flavors.forEach((flavor) => {
			flavors.set(flavor.id, flavor);
		});
	}

	function flattenIngredient(ingredient: FullIngredient) {
		getFlavorsFromIngredient(ingredient);
		ingredient.subIngredients.forEach((subIngredient) => {
			flattenIngredient(subIngredient);
		});
	}

	flattenIngredient(recipe.mainIngredient);

	return flavors;
}

export const flavors: Writable<Map<number, Flavor>> = writable(new Map());
