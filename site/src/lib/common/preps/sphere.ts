import * as THREE from 'three';

import { Direction, FlavorType, type Payload, PrepType } from '@types';
import type { PrepPrimitive } from '.';

export const SphereOperands = {
	radius: FlavorType.Number
};

export const SphereOutputs = {
	sphere: FlavorType.Geometry
};

export const SpherePrep: PrepPrimitive<PrepType.Sphere> = {
	flavors: {
		radius: { directions: [Direction.In], type: FlavorType.Number },
		sphere: { directions: [Direction.Out], type: FlavorType.Geometry }
	},
	cook: (
		_scene: THREE.Scene,
		_camera: THREE.Camera,
		_inPayloads: {
			[prepOperandName: string]: Payload<FlavorType>;
		}
	) => {
		const geometry = new THREE.SphereGeometry();

		return {
			sphere: { type: FlavorType.Geometry, value: geometry }
		};
	}
};
