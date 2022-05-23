import type { Ingredient } from '@prisma/client';
import type { Flavor } from '$lib/flavors';
import type { Connection } from '$lib/connections';

export type { Ingredient } from '@prisma/client';

export type FullIngredient = Ingredient & {
	flavors: Flavor[];
	subIngredients: FullIngredient[];
	connections: Connection[];
};
