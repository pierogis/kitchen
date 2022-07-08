import * as THREE from 'three';

import type { PrepPrimitive, FlavorMap } from '.';
import { Direction, FlavorType, type Payload } from '@types';

export interface TextureOperands extends FlavorMap {
	shader: FlavorType.Number;
}

export interface TextureOutputs extends FlavorMap {
	texture: FlavorType.Image;
}

export const texture: PrepPrimitive<TextureOperands, TextureOutputs> = {
	flavors: {
		// FlavorType.Shader
		shader: { directions: [Direction.In], type: FlavorType.Number },
		// FlavorType.Texture
		texture: { directions: [Direction.Out], type: FlavorType.Image }
	},
	cook: (
		scene: THREE.Scene,
		camera: THREE.Camera,
		inPayloads: {
			[prepOperandName: string]: Payload<FlavorType>;
			// [prepOperandName in keyof TextureOperands]: Payload<TextureOperands[prepOperandName]>;
		}
	) => {
		const value = new THREE.SphereGeometry();
		return {
			texture: { type: FlavorType.Image, value: 'texture' }
		};
	}
};
