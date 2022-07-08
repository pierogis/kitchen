import type { PrepPrimitive } from '.';
import { Direction, FlavorType } from '@types';

export const image: PrepPrimitive = {
	flavors: {
		image: { directions: [Direction.In, Direction.Out], type: FlavorType.Image }
	},
	cook: () => {}
};
