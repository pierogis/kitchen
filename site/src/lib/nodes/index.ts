import { derived, type Readable, type Writable, writable } from 'svelte/store';
import type { Direction } from '$lib/common/types';
import type { FlavorType } from '@prisma/client';
import type { FullIngredient } from '$lib/ingredients';

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

export const ingredientsStore: Writable<{ [ingredientId: number]: FullIngredient }> = writable({});

export const ingredientsRacksStore: Readable<{ [ingredientId: number]: RacksState }> = derived(
	ingredientsStore,
	(ingredients) => {
		return Object.entries(ingredients).reduce((ingredientsRacks, [ingredientId, ingredient]) => {
			ingredientsRacks[Number(ingredientId)] = ingredient.flavors;
			return ingredientsRacks;
		}, {});
	}
);

export function addNode(ingredient: FullIngredient) {
	ingredientsStore.update(($ingredients) => {
		$ingredients[ingredient.id] = ingredient;
		return $ingredients;
	});
}
export function updateNode(ingredient: FullIngredient) {
	ingredientsStore.update(($ingredients) => {
		$ingredients[ingredient.id] = ingredient;
		return $ingredients;
	});
}

export function removeNode(ingredient: FullIngredient) {
	ingredientsStore.update(($ingredients) => {
		delete $ingredients[ingredient.id];
		return $ingredients;
	});
}

// each dock subscribes to this and does its own checking
export const droppedNodeCoordsStore: Writable<{
	dockedStatusStore: Writable<DockedState>;
	coords: { x: number; y: number };
}> = writable();
