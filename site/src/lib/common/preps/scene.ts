import type * as THREE from 'three';

import type { PrepPrimitive } from '.';
import { Direction, FlavorType, PrepType, type Payload } from '@types';
import { Mesh } from 'three';

export const SceneOperands = {
	geometry: FlavorType.Geometry
};

export const SceneOutputs = {
	scene: FlavorType.Object
};

export const ScenePrep: PrepPrimitive<PrepType.Scene> = {
	flavors: {
		geometry: { directions: [Direction.In], type: FlavorType.Geometry },
		scene: { directions: [Direction.Out], type: FlavorType.Object }
	},
	cook: (
		scene: THREE.Scene,
		_camera: THREE.Camera,
		inPayloads: {
			[prepOperandName: string]: Payload<FlavorType>;
		}
	) => {
		const geometry = inPayloads['geometry'].value as THREE.BufferGeometry;
		if (!geometry?.isBufferGeometry) {
			throw `in payload is ${typeof geometry} instead of THREE.BufferGeometry`;
		}

		const mesh = new Mesh(geometry);

		scene.add(mesh);
		return { scene: { type: FlavorType.Object, value: scene } };
	}
};
