import type * as THREE from 'three';

import type { PrepPrimitive, FlavorMap } from '.';
import { Direction, FlavorType, type Payload } from '@types';

export type ShaderOperands = FlavorMap;

export interface ShaderOutputs extends FlavorMap {
	shader: FlavorType.Shader;
}

export const ShaderPrep: PrepPrimitive<ShaderOperands, ShaderOutputs> = {
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
