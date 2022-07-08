import * as THREE from 'three';

import type { PrepPrimitive, FlavorMap } from '.';
import { Direction, FlavorType, type Payload } from '@types';

export interface SphereOperands extends FlavorMap {
	radius: FlavorType.Number;
}

export interface SphereOutputs extends FlavorMap {
	sphere: FlavorType.Number;
}

export const sphere: PrepPrimitive<SphereOperands, SphereOutputs> = {
	flavors: {
		radius: { directions: [Direction.In], type: FlavorType.Number },
		// FlavorType.Geometry
		sphere: { directions: [Direction.Out], type: FlavorType.Number }
	},
	cook: (
		scene: THREE.Scene,
		camera: THREE.Camera,
		inPayloads: {
			[prepOperandName: string]: Payload<FlavorType>;
			// [prepOperandName in keyof SphereOperands]: Payload<SphereOperands[prepOperandName]>;
		}
	) => {
		const value = new THREE.SphereGeometry();
		return {
			sphere: { type: FlavorType.Number, value: 1 }
		};
	}
};
