import type { Flavor } from '$lib/flavors';

export enum Direction {
	in,
	out
}

export interface Ingredient {
	name: string;
	shader?: {
		// should match "in" flavor name with type==FlavorType.image
		image: string;
		// should match "in" flavor name with type==FlavorType.text
		code: string;
		// should match "out" flavor name with type==FlavorType.image
		out: string;
	};
	flavors: Flavor[];
	coords: {
		x: number;
		y: number;
	};
}

export interface Recipe {
	ingredients: {
		[id: string]: Ingredient;
	};
}
