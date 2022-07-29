import type * as THREE from 'three';

import { PrepType, type Flavor, type Payload, type Prep } from '@types';
import { AddPrep, AddOperands, AddOutputs } from './add';
import { ImagePrep, ImageOperands, ImageOutputs } from './image';
import { ShaderPrep, ShaderOperands, ShaderOutputs } from './shader';
import { SpherePrep, SphereOperands, SphereOutputs } from './sphere';
import { TexturePrep, TextureOperands, TextureOutputs } from './texture';
import { PlatePrep, PlateOperands, PlateOutputs } from './plate';
import { MeshPrep, MeshOperands, MeshOutputs } from './mesh';
import { MaterialPrep, MaterialOperands, MaterialOutputs } from './material';

export const PrepOperands = {
	[PrepType.Add]: AddOperands,
	[PrepType.Image]: ImageOperands,
	[PrepType.Shader]: ShaderOperands,
	[PrepType.Sphere]: SphereOperands,
	[PrepType.Texture]: TextureOperands,
	[PrepType.Plate]: PlateOperands,
	[PrepType.Mesh]: MeshOperands,
	[PrepType.Material]: MaterialOperands
};
export type PrepOperands<P extends PrepType> = typeof PrepOperands[P];
export type PrepOperand<P, O> = P extends PrepType
	? O extends keyof PrepOperands<P>
		? PrepOperands<P>[O]
		: never
	: never;

export const PrepOutputs = {
	[PrepType.Add]: AddOutputs,
	[PrepType.Image]: ImageOutputs,
	[PrepType.Shader]: ShaderOutputs,
	[PrepType.Sphere]: SphereOutputs,
	[PrepType.Texture]: TextureOutputs,
	[PrepType.Plate]: PlateOutputs,
	[PrepType.Mesh]: MeshOutputs,
	[PrepType.Material]: MaterialOutputs
};
export type PrepOutputs<P> = P extends PrepType ? typeof PrepOutputs[P] : never;
export type PrepOutput<P, O> = P extends PrepType
	? O extends keyof PrepOutputs<P>
		? PrepOutputs<P>[O]
		: never
	: never;

export type InPayloads<P> = P extends PrepType
	? { [prepOperandName in keyof PrepOperands<P>]: Payload<PrepOperand<P, prepOperandName>> }
	: never;

export type OutPayloads<P> = P extends PrepType
	? { [prepOutputName in keyof PrepOutputs<P>]: Payload<PrepOutput<P, prepOutputName>> }
	: never;

export interface PrepPrimitive<P extends PrepType> {
	flavors: {
		[prepFlavorName in keyof (PrepOperands<P> & PrepOutputs<P>)]: Pick<
			Flavor,
			'directions' | 'type' | 'options'
		>;
	};
	name: string;
	create: (ingredientUuid: string) => { prep: Prep<P>; prepFlavors: Flavor[] };
	cook: (scene: THREE.Scene, camera: THREE.Camera, inPayloads: InPayloads<P>) => OutPayloads<P>;
}

export const prepPrimitives: {
	[prepType in PrepType]: PrepPrimitive<prepType>;
} = {
	[PrepType.Add]: AddPrep,
	[PrepType.Image]: ImagePrep,
	[PrepType.Shader]: ShaderPrep,
	[PrepType.Sphere]: SpherePrep,
	[PrepType.Texture]: TexturePrep,
	[PrepType.Plate]: PlatePrep,
	[PrepType.Mesh]: MeshPrep,
	[PrepType.Material]: MaterialPrep
};
