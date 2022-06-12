import type { Recipe, Parameter, Shader } from '$lib/common/types';
import type { FullCallFor } from '$lib/ingredients';

export { Direction, type Recipe, type Parameter, type Shader } from '@prisma/client';

export type FullRecipe = Recipe & {
	callsFor: FullCallFor[];
	parameters: Parameter[];
	shaders: Shader[];
};
