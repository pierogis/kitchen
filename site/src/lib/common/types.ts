import type { FullCallFor } from '$lib/ingredients';

export interface Parameter {
	uuid: string;
	payload: any;
	recipeUuid: string;
	flavorUuid: string;
	callForUuid: string;
}

export interface Recipe {
	uuid: string;
	mainCallForUuid: string;
}

export interface Shader {
	uuid: string;
	recipeUuid: string;
	ingredientUuid: string;
	imageFlavorUuid: string;
	vertexSource: string;
	fragmentSource: string;
}

export { Direction } from '@prisma/client';

export type FullRecipe = Recipe & {
	callsFor: FullCallFor[];
	parameters: Parameter[];
	shaders: Shader[];
};
