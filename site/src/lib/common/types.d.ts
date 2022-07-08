import type { PrepOutputs } from './preps';

export enum FlavorType {
	Number = 'Number',
	Color = 'Color',
	Text = 'Text',
	Image = 'Image'
}

export enum PrepType {
	Add = 'Add',
	Shader = 'Shader',
	Sphere = 'Sphere',
	Image = 'Image',
	Texture = 'Texture'
}

export enum Direction {
	In = 'In',
	Out = 'Out'
}

// types for api contract
export interface Flavor {
	uuid: string;
	ingredientUuid: string;
	type: FlavorType;
	name: string;
	options: { [optionKey: string]: any } | null;
	directions: Direction[];
	prepUuid?: string;
}

export interface Prep<T extends PrepType> {
	uuid: string;
	name: string;
	ingredientUuid: string;
	type: T;
	// map from default names on prep operands and outputs to flavor uuids
	flavorMap: {
		[prepFlavorName in keyof (PrepOperands[T] | PrepOutputs[T])]: string;
	};
}

export interface Ingredient {
	uuid: string;
	name: string;
	parentIngredientUuid?: string;
}

export interface Connection {
	uuid: string;
	parentIngredientUuid: string;
	flavorType: FlavorType;

	// connection can be usage/usage or usage/prep

	inFlavorUuid: string;
	outFlavorUuid: string;

	inUsageUuid?: string;
	outUsageUuid?: string;
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

export interface CallFor {
	uuid: string;
	recipeUuid: string;
	usageUuid: string;
}

export interface Shader {
	uuid: string;
	recipeUuid: string;
	prepUuid: string;
	vertexSource: string;
	fragmentSource: string;
}

type FlavorTypesPayloadMapper = {
	[FlavorType.Color]: string;
	[FlavorType.Image]: string;
	[FlavorType.Number]: number;
	[FlavorType.Text]: string;
};

export type PayloadValue<T> = T extends FlavorType ? FlavorTypesPayloadMapper[T] : never;

export interface Payload<T extends FlavorType> {
	type: T;
	value: PayloadValue<T>;
}

export interface Parameter {
	uuid: string;
	payload: Payload<FlavorType>;
	recipeUuid: string;
	flavorUuid: string;
	usageUuid: string;
}

export interface Location {
	uuid: string;
	callForUuid: string;
	x: number;
	y: number;
}

// types derived from relationships/specifics
export type FlavorUsage = Flavor & {
	usageUuid: string;
};

export type FullPrep = Prep & {
	flavors: Flavor[];
};

export type Coordinates = Pick<Location, 'x' | 'y'>;

export type FullIngredient = Ingredient & {
	flavors: Flavor[];
	connections: Connection[];
	usages: Usage[];
	preps: Prep[];
};

export type FullCallFor = CallFor & {
	location: Location;
};

export type FullRecipe = Recipe & {
	ingredients: FullIngredient[];
	callsFor: FullCallFor[];
	parameters: Parameter[];
	shaders: Shader[];
};
