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

export type FlavorUsage = Flavor & {
	usageUuid: string;
};

export interface Ingredient {
	uuid: string;
	name: string;
	parentIngredientUuid?: string;
}

export interface Connection {
	uuid: string;
	parentIngredientUuid: string;
	flavorType: FlavorType;
	inFlavorUuid: string;
	outFlavorUuid: string;
	inUsageUuid: string;
	outUsageUuid: string;
}

export interface Usage {
	uuid: string;
	ingredientUuid: string;
	parentUsageUuid?: string;
}

export interface Recipe {
	uuid: string;
	mainCallForUuid: string;
}

export type FullRecipe = Recipe & {
	ingredients: FullIngredient[];
	callsFor: FullCallFor[];
	parameters: Parameter[];
	shaders: Shader[];
};

export interface CallFor {
	uuid: string;
	recipeUuid: string;
	usageUuid: string;
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
	[FlavorType.Color]: string;
	[FlavorType.Image]: string;
	[FlavorType.Number]: number;
	[FlavorType.Text]: string;
};

export type PayloadParams<T> = T extends FlavorType ? FlavorTypesPayloadMapper[T] : never;

export interface Payload<T extends FlavorType> {
	type: T;
	params: PayloadParams<T> | undefined;
}

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
	usages: Usage[];
};

export type FullCallFor = CallFor & {
	location: Location;
};
