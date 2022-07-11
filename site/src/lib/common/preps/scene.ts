import * as THREE from 'three';

import type { PrepPrimitive } from '.';
import { Direction, FlavorType, PrepType } from '@types';

export const SceneOperands = {
	scene: FlavorType.Geometry
} as const;

export const SceneOutputs = {
	scene: FlavorType.Object
} as const;

export const ScenePrep: PrepPrimitive<PrepType.Scene> = {
	flavors: {
		scene: { directions: [Direction.In, Direction.Out], type: FlavorType.Geometry }
	},
	cook: (scene, _camera, inPayloads) => {
		const geometry = inPayloads['scene'].value;

		const mesh = new THREE.Mesh(geometry);

		scene.add(mesh);
		return { scene: { type: FlavorType.Object, value: mesh } };
	}
};
