import type * as THREE from 'three';

import { Direction, PrepType, FlavorType, type Payload } from '@types';
import { AddPrep, type AddOperands, type AddOutputs } from './add';
import { ImagePrep, type ImageOperands, type ImageOutputs } from './image';
import { ShaderPrep, type ShaderOperands, type ShaderOutputs } from './shader';
import { SpherePrep, type SphereOperands, type SphereOutputs } from './sphere';
import { TexturePrep, type TextureOperands, type TextureOutputs } from './texture';
import { ScenePrep, type SceneOperands, type SceneOutputs } from './scene';

export type PrepOperands = {
	[PrepType.Add]: AddOperands;
	[PrepType.Image]: ImageOperands;
	[PrepType.Shader]: ShaderOperands;
	[PrepType.Sphere]: SphereOperands;
	[PrepType.Texture]: TextureOperands;
	[PrepType.Scene]: SceneOperands;
};

export type PrepOutputs = {
	[PrepType.Add]: AddOutputs;
	[PrepType.Image]: ImageOutputs;
	[PrepType.Shader]: ShaderOutputs;
	[PrepType.Sphere]: SphereOutputs;
	[PrepType.Texture]: TextureOutputs;
	[PrepType.Scene]: SceneOutputs;
};

export type FlavorMap = { [prepFlavorName: string]: FlavorType };

export interface PrepPrimitive<I extends FlavorMap, O extends FlavorMap> {
	flavors: { [prepFlavorName in keyof (I | O)]: { directions: Direction[]; type: FlavorType } };
	cook: (
		scene: THREE.Scene,
		camera: THREE.Camera,
		inPayloads: {
			[prepOperandName: string]: Payload<FlavorType>;
		}
	) => { [prepOutputName in keyof O]: Payload<O[prepOutputName]> };
}

export const prepPrimitives: {
	[prepType in PrepType]: PrepPrimitive<PrepOperands[prepType], PrepOutputs[prepType]>;
} = {
	[PrepType.Add]: AddPrep,
	[PrepType.Image]: ImagePrep,
	[PrepType.Shader]: ShaderPrep,
	[PrepType.Sphere]: SpherePrep,
	[PrepType.Texture]: TexturePrep,
	[PrepType.Scene]: ScenePrep
};
