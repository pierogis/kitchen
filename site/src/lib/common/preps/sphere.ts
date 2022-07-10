import * as THREE from 'three';

import { Direction, FlavorType, type Payload } from '@types';
import type { PrepPrimitive, FlavorMap } from '.';

export interface SphereOperands extends FlavorMap {
	radius: FlavorType.Number;
}

export interface SphereOutputs extends FlavorMap {
	sphere: FlavorType.Geometry;
}

export const SpherePrep: PrepPrimitive<SphereOperands, SphereOutputs> = {
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
