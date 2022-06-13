// import { v4 as uuid } from 'uuid';
// import { derived, type Writable, writable } from 'svelte/store';

import { derived, type Readable } from 'svelte/store';
import { state } from '.';

// import type { Direction, FullRecipe } from '$lib/common/types';
// import { writableMap, type WritableMap } from '$lib/common/stores';

import type { Ingredient, FullRecipe } from '$lib/common/types';

// export type NodeParameters = {
// 	[key: string]: any;
// };

// export type RackState = {
// 	flavorType: FlavorType;
// };

// export type RacksState = {
// 	In: { [flavorName: string]: RackState };
// 	Out: { [flavorName: string]: RackState };
// };

// export interface DockedState {
// 	docked: boolean;
// 	direction?: Direction;
// }

// export const ingredients: WritableMap<string, Ingredient> = writableMap(new Map());

export function storeIngredients(recipe: FullRecipe): Map<string, Ingredient> {
	return new Map(recipe.callsFor.map((callFor) => [callFor.ingredientUuid, callFor.ingredient]));
}

// export function addIngredient(ingredient: Omit<Ingredient, 'uuid'>) {
// 	const newUuid = uuid();

// 	const newIngredient = { ...ingredient, uuid: newUuid };

// 	return ingredients.add(newUuid, newIngredient);
// }

// export const ingredientsRacks = derived(ingredients, (currentIngredients) =>
// 	Object.entries(currentIngredients).reduce<{ [ingredientUuid: string]: RackState }>(
// 		(currentIngredientsRacks, [ingredientUuid, ingredient]) => {
// 			currentIngredientsRacks[Number(ingredientUuid)] = ingredient.flavors;
// 			return currentIngredientsRacks;
// 		},
// 		{}
// 	)
// );

// // each dock subscribes to this and does its own checking
// export const droppedNodeCoordsStore: Writable<{
// 	dockedStatusStore: Writable<DockedState>;
// 	coords: { x: number; y: number };
// }> = writable();

export const ingredients: Readable<Map<string, Ingredient>> = derived(state, (currentState) => {
	return currentState.ingredients;
});
