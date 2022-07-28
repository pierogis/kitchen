import type { PrepPrimitive } from '.';
import { Direction, FlavorType, PrepType } from '@types';

export const ImageOperands = {
	image: FlavorType.Image
} as const;

export const ImageOutputs = {
	image: FlavorType.Image
} as const;

export const ImagePrep: PrepPrimitive<PrepType.Image> = {
	flavors: {
		image: { directions: [Direction.In, Direction.Out], type: FlavorType.Image }
	},
	cook: (_scene, _camera, inPayloads) => {
		return { image: { type: FlavorType.Image, value: inPayloads['image'].value } };
	}
};
