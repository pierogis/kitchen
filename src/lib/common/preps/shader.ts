import { v4 as uuid } from 'uuid';

import type * as THREE from 'three';

import { Direction, FlavorType, PrepType, type Flavor, type Prep } from '$types';
import type { PrepPrimitive } from '.';

export const ShaderOperands = {} as const;

export const ShaderOutputs = {
	shader: FlavorType.Shader
} as const;

const name = 'shader';

export const ShaderPrep: PrepPrimitive<PrepType.Shader> = {
	flavors: {
		shader: { directions: [Direction.Out], type: FlavorType.Shader, options: null }
	},
	name,
	create: (prepUuid: string, ingredientUuid: string, direction: Direction) => {
		const shaderFlavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Shader,
			name: 'shader',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.Out]
		};

		const prep: Prep<PrepType.Shader> = {
			uuid: prepUuid,
			name,
			ingredientUuid,
			type: PrepType.Shader,
			// map from default names on prep operands and outputs to flavor uuids
			inFlavorUuidMap: {},
			outFlavorUuidMap: {
				shader: shaderFlavor.uuid
			},
			direction
		};

		const prepFlavors = [shaderFlavor];

		return { prep, prepFlavors };
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
