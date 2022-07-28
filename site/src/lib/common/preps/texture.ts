import * as THREE from 'three';

import type { PrepPrimitive } from '.';
import { Direction, FlavorType, PrepType } from '@types';

export const TextureOperands = {
	shader: FlavorType.Shader
} as const;

export const TextureOutputs = {
	texture: FlavorType.Texture
} as const;

export const TexturePrep: PrepPrimitive<PrepType.Texture> = {
	flavors: {
		shader: { directions: [Direction.In], type: FlavorType.Shader },
		texture: { directions: [Direction.Out], type: FlavorType.Texture }
	},
	cook: (_scene, _camera, _inPayloads) => {
		const value = new THREE.Texture();

		return {
			texture: { type: FlavorType.Texture, value }
		};
	}
};
