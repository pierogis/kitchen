import type * as THREE from 'three';

import { Direction, PrepType, FlavorType, type Payload } from '@types';
import { add, type AddOperands, type AddOutputs } from './add';
import { image, type ImageOperands, type ImageOutputs } from './image';
import { shader, type ShaderOperands, type ShaderOutputs } from './shader';
import { sphere, type SphereOperands, type SphereOutputs } from './sphere';
import { texture, type TextureOperands, type TextureOutputs } from './texture';

export type PrepOperands = {
	[PrepType.Add]: AddOperands;
	[PrepType.Image]: ImageOperands;
	[PrepType.Shader]: ShaderOperands;
	[PrepType.Sphere]: SphereOperands;
	[PrepType.Texture]: TextureOperands;
};

export type PrepOutputs = {
	[PrepType.Add]: AddOutputs;
	[PrepType.Image]: ImageOutputs;
	[PrepType.Shader]: ShaderOutputs;
	[PrepType.Sphere]: SphereOutputs;
	[PrepType.Texture]: TextureOutputs;
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
	[PrepType.Add]: add,
	[PrepType.Image]: image,
	[PrepType.Shader]: shader,
	[PrepType.Sphere]: sphere,
	[PrepType.Texture]: texture
};
