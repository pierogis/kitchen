export enum FlavorType {
	Number = 'Number',
	Color = 'Color',
	Text = 'Text',
	Image = 'Image'
}

export enum PrepType {
	Shader = 'Shader',
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
}

export interface Prep {
	uuid: string;
	name: string;
	ingredientUuid: string;
	type: PrepType;
	// map from default names on prep operands and outputs to flavor uuids
	flavorMap: {
		[prepFlavorName: string]: string;
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
	// should have either of these two
	inUsageUuid?: string;
	inPrepUuid?: string;

	outFlavorUuid: string;
	// should have either of these two
	outUsageUuid?: string;
	outPrepUuid?: string;
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
