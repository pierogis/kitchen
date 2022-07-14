import * as THREE from 'three';

import type { PrepPrimitive } from '.';
import { Direction, FlavorType, PrepType } from '@types';

export const MaterialOperands = {
	color: FlavorType.Color
} as const;

export const MaterialOutputs = {
	material: FlavorType.Material
} as const;

export const MaterialPrep: PrepPrimitive<PrepType.Material> = {
	flavors: {
		color: { directions: [Direction.In], type: FlavorType.Color },
		material: { directions: [Direction.Out], type: FlavorType.Material }
	},
	cook: (_scene, _camera, inPayloads) => {
		const color = inPayloads['color'].value;
		const value = new THREE.MeshBasicMaterial({ color });

		return {
			material: { type: FlavorType.Material, value }
		};
	}
};
