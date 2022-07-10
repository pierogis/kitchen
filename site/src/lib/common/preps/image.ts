import type * as THREE from 'three';

import type { PrepPrimitive } from '.';
import { Direction, FlavorType, PrepType, type Payload } from '@types';

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
	cook: (
		_scene: THREE.Scene,
		_camera: THREE.Camera,
		inPayloads: {
			[prepOperandName: string]: Payload<FlavorType>;
		}
	) => {
		return { image: { type: FlavorType.Image, value: String(inPayloads['image'].value) } };
	}
};
