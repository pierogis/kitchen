import type { PrepPrimitive } from '.';
import { Direction, FlavorType, PrepType } from '@types';

export const PlateOperands = {
	object: FlavorType.Object
} as const;

export const PlateOutputs = {
	plate: FlavorType.Object
} as const;

export const PlatePrep: PrepPrimitive<PrepType.Plate> = {
	flavors: {
		plate: { directions: [Direction.Out], type: FlavorType.Object },
		object: { directions: [Direction.In], type: FlavorType.Object }
	},
	cook: (scene, _camera, inPayloads) => {
		const object = inPayloads['object'].value;

		scene.add(object);
		return {
			plate: { type: FlavorType.Object, value: scene }
		};
	}
};
