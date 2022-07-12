import type { PrepOperands, PrepOutputs } from './preps';
import type * as THREE from 'three';

export enum FlavorType {
	Number = 'Number',
	Color = 'Color',
	Text = 'Text',
	Image = 'Image',
	Geometry = 'Geometry',
	Texture = 'Texture',
	Material = 'Texture',
	Shader = 'Shader',
	Object = 'Object'
}

export enum PrepType {
	Add = 'Add',
	Shader = 'Shader',
	Sphere = 'Sphere',
	Image = 'Image',
	Texture = 'Texture',
	AddToScene = 'AddToScene',
	Mesh = 'Mesh'
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

export type FlavorUuidMap<P, D> = P extends PrepType
	? D extends Direction
		? {
				[prepFlavorName in keyof (D extends Direction.In
					? PrepOperands<P>
					: PrepOutputs<P>)]: string;
		  }
		: never
	: never;

export interface Prep<P extends PrepType> {
	uuid: string;
	name: string;
	ingredientUuid: string;
	type: P;
	// map from default names on prep operands and outputs to flavor uuids
	inFlavorUuidMap: FlavorUuidMap<P, Direction.In>;
	outFlavorUuidMap: FlavorUuidMap<P, Direction.Out>;
	direction: Direction;
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
	[FlavorType.Geometry]: THREE.BufferGeometry;
	[FlavorType.Texture]: THREE.Texture;
	[FlavorType.Shader]: THREE.Shader;
	[FlavorType.Object]: THREE.Object3D;
};

export type PayloadValue<T> = T extends FlavorType ? FlavorTypesPayloadMapper[T] : never;

export interface Payload<T extends FlavorType> {
	type: T;
	value: PayloadValue<T>;
}

export interface Parameter<T extends FlavorType> {
	uuid: string;
	payload: Payload<T>;
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
	usageUuid?: string;
};

export type FullPrep<T extends PrepType> = Prep<T> & {
	flavors: FlavorUsage[];
};

export type Coordinates = Pick<Location, 'x' | 'y'>;

export type FullIngredient = Ingredient & {
	flavors: Flavor[];
	connections: Connection[];
	usages: Usage[];
	preps: Prep<PrepType>[];
};

export type FullCallFor = CallFor & {
	location: Location;
};

export type FullRecipe = Recipe & {
	ingredients: FullIngredient[];
	callsFor: FullCallFor[];
	parameters: Parameter<FlavorType>[];
	shaders: Shader[];
};
