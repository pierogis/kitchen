import type { PrepPrimitive } from '.';
import { Direction, FlavorType } from '@types';

export const shader: PrepPrimitive = {
	flavors: {
		// FlavorType.Shader
		shader: { directions: [Direction.Out], type: FlavorType.Number }
	},
	cook: () => {}
};
