import type * as THREE from 'three';

import type { PrepPrimitive } from '.';
import { Direction, FlavorType, PrepType, type Payload } from '@types';

export const ShaderOperands = {};

export const ShaderOutputs = {
	shader: FlavorType.Shader
} as const;

export const ShaderPrep: PrepPrimitive<PrepType.Shader> = {
	flavors: {
		shader: { directions: [Direction.Out], type: FlavorType.Shader }
	},
	cook: (
		_scene: THREE.Scene,
		_camera: THREE.Camera,
		_inPayloads: {
			[prepOperandName: string]: Payload<FlavorType>;
		}
	) => {
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
