import type * as THREE from 'three';

import { Direction, PrepType, FlavorType, type Payload } from '@types';
import { AddPrep, AddOperands, AddOutputs } from './add';
import { ImagePrep, ImageOperands, ImageOutputs } from './image';
import { ShaderPrep, ShaderOperands, ShaderOutputs } from './shader';
import { SpherePrep, SphereOperands, SphereOutputs } from './sphere';
import { TexturePrep, TextureOperands, TextureOutputs } from './texture';
import { ScenePrep, SceneOperands, SceneOutputs } from './scene';

export const PrepOperands: {
	[key in PrepType]: FlavorMap;
} = {
	[PrepType.Add]: AddOperands,
	[PrepType.Image]: ImageOperands,
	[PrepType.Shader]: ShaderOperands,
	[PrepType.Sphere]: SphereOperands,
	[PrepType.Texture]: TextureOperands,
	[PrepType.Scene]: SceneOperands
};

export const PrepOutputs: {
	[key in PrepType]: FlavorMap;
} = {
	[PrepType.Add]: AddOutputs,
	[PrepType.Image]: ImageOutputs,
	[PrepType.Shader]: ShaderOutputs,
	[PrepType.Sphere]: SphereOutputs,
	[PrepType.Texture]: TextureOutputs,
	[PrepType.Scene]: SceneOutputs
};

type FlavorMap = { [prepFlavorName: string]: FlavorType };

type Operands<T> = T extends PrepType ? typeof PrepOperands[T] : never;
type Outputs<T> = T extends PrepType ? typeof PrepOutputs[T] : never;

export type InPayloads<T> = T extends PrepType
	? { [prepOutputName in keyof typeof PrepOperands[T]]: Payload<Operands<T>[prepOutputName]> }
	: never;

export type OutPayloads<T> = T extends PrepType
	? { [prepOutputName in keyof typeof PrepOutputs[T]]: Payload<Outputs<T>[prepOutputName]> }
	: never;

export interface PrepPrimitive<T extends PrepType> {
	flavors: {
		[prepFlavorName in keyof (typeof PrepOperands[T] | typeof PrepOutputs[T])]: {
			directions: Direction[];
			type: FlavorType;
		};
	};
	cook: (scene: THREE.Scene, camera: THREE.Camera, inPayloads: InPayloads<T>) => OutPayloads<T>;
}

export const prepPrimitives: {
	[prepType in PrepType]: PrepPrimitive<prepType>;
} = {
	[PrepType.Add]: AddPrep,
	[PrepType.Image]: ImagePrep,
	[PrepType.Shader]: ShaderPrep,
	[PrepType.Sphere]: SpherePrep,
	[PrepType.Texture]: TexturePrep,
	[PrepType.Scene]: ScenePrep
};
