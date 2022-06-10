import type { Recipe, Parameter, Shader } from '$lib/common/types';
import type { FullIngredient } from '$lib/ingredients';

export { Direction, type Recipe, type Parameter, type Shader } from '@prisma/client';

export type FullRecipe = Recipe & {
	mainIngredient: FullIngredient;
	parameters: Parameter[];
	shaders: Shader[];
};
