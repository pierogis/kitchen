import * as THREE from 'three';

import type { PrepPrimitive } from '.';
import { Direction, FlavorType, type Payload, PrepType } from '@types';

export const TextureOperands = {
	shader: FlavorType.Shader
};

export const TextureOutputs = {
	texture: FlavorType.Texture
};

export const TexturePrep: PrepPrimitive<PrepType.Texture> = {
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
