import type * as THREE from 'three';

import type { PrepPrimitive } from '.';
import { Direction, FlavorType, PrepType } from '@types';

export const ShaderOperands = {} as const;

export const ShaderOutputs = {
	shader: FlavorType.Shader
} as const;

export const ShaderPrep: PrepPrimitive<PrepType.Shader> = {
	flavors: {
		shader: { directions: [Direction.Out], type: FlavorType.Shader }
	},
	cook: (_scene, _camera, _inPayloads) => {
		const value: THREE.Shader = {
			uniforms: {},
			vertexShader: '',
			fragmentShader: ''
		};

		return {
			shader: { type: FlavorType.Shader, value }
		};
	}
};
