import type { Flavor } from '$lib/flavors';
import type { Connection } from '$lib/connections';

export interface Ingredient {
	uuid: string;
	name: string;
	parentIngredientUuid: string;
}

export interface CallFor {
	uuid: string;
	recipeUuid: string;
	ingredientUuid: string;
}

export interface Location {
	uuid: string;
	callForUuid: string;
	x: number;
	y: number;
}

export type FullIngredient = Ingredient & {
	flavors: Flavor[];
	connections: Connection[];
};

export type FullCallFor = CallFor & {
	ingredient: FullIngredient;
	location: Location;
};
