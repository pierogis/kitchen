import { Direction, FlavorType } from '@types';
import { SphereGeometry, type Scene } from 'three';
import type { Prep } from '.';

export const Sphere: Prep = {
	flavors: [
		{
			name: 'lower',
			type: FlavorType.Number,
			directions: [Direction.In],
			options: {
				min: 0,
				max: 255
			}
		}
	],
	cook: () => {
		return new SphereGeometry();
	}
};
