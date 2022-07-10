import * as THREE from 'three';

import type { PrepPrimitive, FlavorMap } from '.';
import { Direction, FlavorType, type Payload } from '@types';

export interface TextureOperands extends FlavorMap {
	shader: FlavorType.Shader;
}

export interface TextureOutputs extends FlavorMap {
	texture: FlavorType.Texture;
}

export const TexturePrep: PrepPrimitive<TextureOperands, TextureOutputs> = {
	flavors: {
		shader: { directions: [Direction.In], type: FlavorType.Shader },
		texture: { directions: [Direction.Out], type: FlavorType.Texture }
	},
	cook: (
		_scene: THREE.Scene,
		_camera: THREE.Camera,
		_inPayloads: {
			[prepOperandName: string]: Payload<FlavorType>;
		}
	) => {
		const value = new THREE.Texture();

		return {
			texture: { type: FlavorType.Texture, value }
		};
	}
};
