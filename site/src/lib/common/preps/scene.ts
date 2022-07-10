import type * as THREE from 'three';

import type { PrepPrimitive, FlavorMap } from '.';
import { Direction, FlavorType, type Payload } from '@types';
import { Mesh } from 'three';

export interface SceneOperands extends FlavorMap {
	geometry: FlavorType.Geometry;
}

export interface SceneOutputs extends FlavorMap {
	scene: FlavorType.Object;
}

export const ScenePrep: PrepPrimitive<SceneOperands, SceneOutputs> = {
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
