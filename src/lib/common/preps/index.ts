import type * as THREE from 'three';

import { Direction, PrepType, type Flavor, type Payload, type Prep } from '$types';
import { AddPrep, AddOperands, AddOutputs } from './add';
import { ImagePrep, ImageOperands, ImageOutputs } from './image';
import { ShaderPrep, ShaderOperands, ShaderOutputs } from './shader';
import { TexturePrep, TextureOperands, TextureOutputs } from './texture';
import { PlatePrep, PlateOperands, PlateOutputs } from './plate';
import { MeshPrep, MeshOperands, MeshOutputs } from './mesh';
import { MaterialPrep, MaterialOperands, MaterialOutputs } from './material';
import { SpherePrep, SphereOperands, SphereOutputs } from './sphere';
import { BoxPrep, BoxOperands, BoxOutputs } from './box';

export const PrepOperands = {
	[PrepType.Sphere]: SphereOperands,
	[PrepType.Box]: BoxOperands,
	[PrepType.Add]: AddOperands,
	[PrepType.Image]: ImageOperands,
	[PrepType.Shader]: ShaderOperands,
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
	[PrepType.Sphere]: SphereOutputs,
	[PrepType.Box]: BoxOutputs,
	[PrepType.Add]: AddOutputs,
	[PrepType.Image]: ImageOutputs,
	[PrepType.Shader]: ShaderOutputs,
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
	create: (
		prepUuid: string,
		ingredientUuid: string,
		direction: Direction
	) => { prep: Prep<P>; prepFlavors: Flavor[] };
	cook: (scene: THREE.Scene, camera: THREE.Camera, inPayloads: InPayloads<P>) => OutPayloads<P>;
}

export const prepTypes: { [groupName: string]: { [name: string]: PrepType } } = {
	shape: { sphere: PrepType.Sphere, box: PrepType.Box },
	fundamental: { add: PrepType.Add },
	file: { image: PrepType.Image },
	'3d': {
		material: PrepType.Material,
		mesh: PrepType.Mesh,
		texture: PrepType.Texture,
		shader: PrepType.Shader
	},
	output: { plate: PrepType.Plate }
};

export const prepPrimitives: {
	[prepType in PrepType]: PrepPrimitive<prepType>;
} = {
	[PrepType.Sphere]: SpherePrep,
	[PrepType.Box]: BoxPrep,
	[PrepType.Add]: AddPrep,
	[PrepType.Image]: ImagePrep,
	[PrepType.Shader]: ShaderPrep,
	[PrepType.Texture]: TexturePrep,
	[PrepType.Plate]: PlatePrep,
	[PrepType.Mesh]: MeshPrep,
	[PrepType.Material]: MaterialPrep
};
