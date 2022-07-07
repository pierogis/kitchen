export enum FlavorType {
	Number = 'Number',
	Color = 'Color',
	Text = 'Text',
	Image = 'Image'
}

export enum Direction {
	In = 'In',
	Out = 'Out'
}

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

export interface Prep {
	uuid: string;
	name: string;
	ingredientUuid: string;
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

export type Coordinates = Pick<Location, 'x' | 'y'>;

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
