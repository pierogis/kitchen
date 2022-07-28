import * as THREE from 'three';

import { Direction, FlavorType, PrepType } from '@types';
import type { PrepPrimitive, InPayloads } from '.';

export const SphereOperands = {
	radius: FlavorType.Number
} as const;
export const SphereOutputs = {
	sphere: FlavorType.Geometry
} as const;

export const SpherePrep: PrepPrimitive<PrepType.Sphere> = {
	flavors: {
		sphere: { directions: [Direction.Out], type: FlavorType.Geometry },
		radius: { directions: [Direction.In], type: FlavorType.Number }
	},
	cook: (_scene, _camera, _inPayloads: InPayloads<PrepType.Sphere>) => {
		const radius = _inPayloads['radius'].value;
		const geometry = new THREE.SphereGeometry(radius);

		return {
			sphere: { type: FlavorType.Geometry, value: geometry }
		};
	}
};
