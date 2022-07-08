import type * as THREE from 'three';

import type { PrepPrimitive, FlavorMap } from '.';
import { Direction, FlavorType, type Payload } from '@types';

export interface ImageOperands extends FlavorMap {
	image: FlavorType.Image;
}

export interface ImageOutputs extends FlavorMap {
	image: FlavorType.Image;
}

export const image: PrepPrimitive<ImageOperands, ImageOutputs> = {
	flavors: {
		image: { directions: [Direction.In, Direction.Out], type: FlavorType.Image }
	},
	cook: (
		scene: THREE.Scene,
		camera: THREE.Camera,
		inPayloads: {
			[prepOperandName: string]: Payload<FlavorType>;
		}
	) => {
		return { image: { type: FlavorType.Image, value: String(inPayloads['image'].value) } };
	}
};
