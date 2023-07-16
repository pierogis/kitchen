import { v4 as uuid } from 'uuid';

import * as THREE from 'three';

import { Direction, FlavorType, PrepType, type Flavor, type Prep } from '$types';
import type { PrepPrimitive } from '.';

export const TextureOperands = {
	shader: FlavorType.Shader
} as const;

export const TextureOutputs = {
	texture: FlavorType.Texture
} as const;

const name = 'texture';

export const TexturePrep: PrepPrimitive<PrepType.Texture> = {
	flavors: {
		shader: { directions: [Direction.In], type: FlavorType.Shader, options: null },
		texture: { directions: [Direction.Out], type: FlavorType.Texture, options: null }
	},
	name,
	create: (prepUuid: string, ingredientUuid: string, direction: Direction) => {
		const textureFlavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Texture,
			name: 'texture',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.Out]
		};
		const shaderFlavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Shader,
			name: 'shader',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.In]
		};

		const prep: Prep<PrepType.Texture> = {
			uuid: prepUuid,
			name,
			ingredientUuid,
			type: PrepType.Texture,
			// map from default names on prep operands and outputs to flavor uuids
			inFlavorUuidMap: {
				shader: shaderFlavor.uuid
			},
			outFlavorUuidMap: {
				texture: textureFlavor.uuid
			},
			direction
		};

		const prepFlavors = [shaderFlavor, textureFlavor];

		return { prep, prepFlavors };
	},
	cook: (_scene, _camera, _inPayloads) => {
		const value = new THREE.Texture();

		return {
			texture: { type: FlavorType.Texture, value }
		};
	}
};
