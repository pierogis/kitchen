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

import { v4 as uuid } from 'uuid';
import { derived, type Writable, writable } from 'svelte/store';

import type { Direction, FullRecipe } from '$lib/common/types';
import { writableMap, type WritableMap } from '$lib/common/stores';

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

export const ingredients: WritableMap<string, Ingredient> = writableMap(new Map());

export function storeIngredients(recipe: FullRecipe) {
	ingredients.set(
		new Map(recipe.callsFor.map((callFor) => [callFor.ingredientUuid, callFor.ingredient]))
	);
}

export function addIngredient(ingredient: Omit<Ingredient, 'uuid'>) {
	const newUuid = uuid();

	const newIngredient = { ...ingredient, uuid: newUuid };

	return ingredients.add(newUuid, newIngredient);
}

// export function addNode(ingredient: FullIngredient) {
// 	ingredients.update((currentIngredients) => {
// 		currentIngredients.set(ingredient.uuid, ingredient);
// 		return currentIngredients;
// 	});
// }
// export function updateNode(ingredient: FullIngredient) {
// 	ingredients.update((currentIngredients) => {
// 		currentIngredients.set(ingredient.uuid, ingredient);
// 		return currentIngredients;
// 	});
// }

// export function removeNode(ingredient: FullIngredient) {
// 	ingredients.update((currentIngredients) => {
// 		currentIngredients.set(ingredient.uuid, ingredient);
// 		return currentIngredients;
// 	});
// }

export const ingredientsRacks = derived(ingredients, (currentIngredients) =>
	Object.entries(currentIngredients).reduce<{ [ingredientUuid: string]: RackState }>(
		(currentIngredientsRacks, [ingredientUuid, ingredient]) => {
			currentIngredientsRacks[Number(ingredientUuid)] = ingredient.flavors;
			return currentIngredientsRacks;
		},
		{}
	)
);

// each dock subscribes to this and does its own checking
export const droppedNodeCoordsStore: Writable<{
	dockedStatusStore: Writable<DockedState>;
	coords: { x: number; y: number };
}> = writable();
