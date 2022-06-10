// import { type Writable, derived } from 'svelte/store';
// import type { FullIngredient } from '$lib/ingredients';

// const localIngredients = localStorage.getItem('ingredients');
// if (localIngredients !== null) {
// 	JSON.parse(localIngredients);
// } else {
// 	[];
// }

// export const ingredients: Writable<FullIngredient>[] =
// 	localIngredients !== null ? JSON.parse(localIngredients) : [];

// derived(ingredients, (currentIngredients) => currentIngredients).subscribe((currentIngredients) => {
// 	localStorage.setItem('ingredients', JSON.stringify(currentIngredients));
// });

// import { browser } from '$app/env';

// export const colorsStore: Writable<string[]> = writable(
// 	browser
// 		? localStorage.getItem('ingredients')
// 			? JSON.parse(localStorage.getItem('ingredients'))
// 			: []
// 		: []
// );

// colorsStore.subscribe((colors) => {
// 	if (browser) {
// 		localStorage.setItem('colors', JSON.stringify(colors));
// 	}
// });
import { derived, type Readable, type Writable, writable } from 'svelte/store';
import type { Direction, FullRecipe } from '$lib/common/types';
import type { FlavorType } from '$lib/flavors';
import type { FullIngredient, Ingredient } from '$lib/ingredients';

export type NodeParameters = {
	[key: string]: any;
};

export type RackState = {
	flavorType: FlavorType;
};

export type RacksState = {
	In: { [flavorName: string]: RackState };
	Out: { [flavorName: string]: RackState };
};

export interface DockedState {
	docked: boolean;
	direction?: Direction;
}

export function flattenIngredients(recipe: FullRecipe): Map<number, Ingredient> {
	const ingredients: Map<number, Ingredient> = new Map();
	ingredients.set(recipe.mainIngredient.id, recipe.mainIngredient);

	function flattenIngredient(ingredient: FullIngredient) {
		ingredient.subIngredients.forEach((subIngredient) => {
			flattenIngredient(subIngredient);
			ingredients.set(subIngredient.id, subIngredient);
		});
	}

	flattenIngredient(recipe.mainIngredient);

	return ingredients;
}

export const ingredients: Writable<Map<number, Ingredient>> = writable(new Map());

export const ingredientsRacks = derived(ingredients, (currentIngredients) =>
	Object.entries(currentIngredients).reduce<{ [ingredientId: number]: RackState }>(
		(currentIngredientsRacks, [ingredientId, ingredient]) => {
			currentIngredientsRacks[Number(ingredientId)] = ingredient.flavors;
			return currentIngredientsRacks;
		},
		{}
	)
);

export function addNode(ingredient: FullIngredient) {
	ingredients.update((currentIngredients) => {
		currentIngredients[ingredient.id] = ingredient;
		return currentIngredients;
	});
}
export function updateNode(ingredient: FullIngredient) {
	ingredients.update((currentIngredients) => {
		currentIngredients[ingredient.id] = ingredient;
		return currentIngredients;
	});
}

export function removeNode(ingredient: FullIngredient) {
	ingredients.update((currentIngredients) => {
		delete currentIngredients[ingredient.id];
		return currentIngredients;
	});
}

// each dock subscribes to this and does its own checking
export const droppedNodeCoordsStore: Writable<{
	dockedStatusStore: Writable<DockedState>;
	coords: { x: number; y: number };
}> = writable();
