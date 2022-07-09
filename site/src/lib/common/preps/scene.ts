import * as THREE from 'three';

import type { PrepPrimitive, FlavorMap } from '.';
import { Direction, FlavorType, type Payload } from '@types';

export interface SceneOperands extends FlavorMap {
	geometry: FlavorType.Geometry;
}

export interface SceneOutputs extends FlavorMap {
	geometry: FlavorType.Geometry;
}

export const scene: PrepPrimitive<SceneOperands, SceneOutputs> = {
	flavors: {
		geometry: { directions: [Direction.In, Direction.Out], type: FlavorType.Geometry }
	},
	cook: (
		scene: THREE.Scene,
		camera: THREE.Camera,
		inPayloads: {
			[prepOperandName: string]: Payload<FlavorType>;
		}
	) => {
		const geometry = inPayloads['geometry'].value;
		if (!(geometry instanceof THREE.Object3D))
			throw `in payload is ${typeof geometry} instead of THREE.Object3D`;

		scene.add(geometry);
		return { geometry: { type: FlavorType.Geometry, value: geometry } };
	}
};
