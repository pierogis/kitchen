import type { Flavor } from '$lib/flavors';
import type { Ingredient } from '$lib/ingredients';

export { Direction } from '@prisma/client';

export interface Recipe {
	ingredients: Ingredient[];
	flavors: Flavor[];
}
