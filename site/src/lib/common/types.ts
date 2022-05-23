import type { Recipe } from '@prisma/client';
import type { FullIngredient } from '$lib/ingredients';

export { Direction, type Recipe } from '@prisma/client';

export type FullRecipe = Recipe & {
	mainIngredient: FullIngredient;
};
