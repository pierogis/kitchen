import type { PrepPrimitive } from '.';
import { Direction, FlavorType } from '@types';

export const texture: PrepPrimitive = {
	flavors: {
		// FlavorType.Texture
		texture: { directions: [Direction.Out], type: FlavorType.Image },
		// FlavorType.Shader
		shader: { directions: [Direction.In], type: FlavorType.Number }
	},
	cook: () => {}
};
