import { type Writable, writable } from 'svelte/store';
import type { FullRecipe } from '$lib/common/types';
import type { Connection } from '$lib/connections';
import type { FullIngredient } from '$lib/ingredients';

export function flattenConnections(recipe: FullRecipe): Map<number, Connection> {
	const connections: Map<number, Connection> = new Map();

	function getConnectionsFromIngredient(ingredient: FullIngredient) {
		ingredient.connections.forEach((connection) => {
			connections.set(connection.id, connection);
		});
	}

	function flattenIngredient(ingredient: FullIngredient) {
		getConnectionsFromIngredient(ingredient);
		ingredient.subIngredients.forEach((subIngredient) => {
			flattenIngredient(subIngredient);
		});
	}

	flattenIngredient(recipe.mainIngredient);

	return connections;
}

export const connections: Writable<Map<number, Connection>> = writable(new Map());
