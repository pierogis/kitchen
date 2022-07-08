import { Direction, FlavorType } from '@types';
import { SphereGeometry } from 'three';
import type { PrepPrimitive } from '.';

export const sphere: PrepPrimitive = {
	flavors: {
		radius: { directions: [Direction.In], type: FlavorType.Number },
		// FlavorType.Geometry
		sphere: { directions: [Direction.Out], type: FlavorType.Number }
	},
	cook: () => {
		return new SphereGeometry();
	}
};
