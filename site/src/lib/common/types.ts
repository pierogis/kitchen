import type { Direction, FlavorType } from '@prisma/client';
export { Direction, FlavorType } from '@prisma/client';

// types with for api contract
export interface Flavor {
	uuid: string;
	ingredientUuid: string;
	type: FlavorType;
	name: string;
	options: { [optionKey: string]: any } | null;
	directions: Direction[];
}

export interface Ingredient {
	uuid: string;
	name: string;
}

export interface Connection {
	uuid: string;
	parentIngredientUuid: string;
	inFlavorUuid: string;
	outFlavorUuid: string;
}

export interface Recipe {
	uuid: string;
	mainCallForUuid: string;
}

export type FullRecipe = Recipe & {
	callsFor: FullCallFor[];
	parameters: Parameter[];
	shaders: Shader[];
};

export interface CallFor {
	uuid: string;
	recipeUuid: string;
	ingredientUuid: string;
	parentCallForUuid: string;
}

export interface Shader {
	uuid: string;
	recipeUuid: string;
	ingredientUuid: string;
	imageFlavorUuid: string;
	vertexSource: string;
	fragmentSource: string;
}

export interface Parameter {
	uuid: string;
	payload: Payload<FlavorType>;
	recipeUuid: string;
	flavorUuid: string;
	callForUuid: string;
}

type FlavorTypesPayloadMapper = {
	type: FlavorType;
	Color: { r: number; g: number; b: number };
	Image: string;
	Number: number;
	Text: string;
};

export type Payload<T> = T extends FlavorType
	? { [key in T]: FlavorTypesPayloadMapper[T] } & {
			type: T;
	  }
	: never;

export interface Location {
	uuid: string;
	callForUuid: string;
	x: number;
	y: number;
}

// types with relations included
export type FullIngredient = Ingredient & {
	flavors: Flavor[];
	connections: Connection[];
};

export type FullCallFor = CallFor & {
	ingredient: FullIngredient;
	location: Location;
};
