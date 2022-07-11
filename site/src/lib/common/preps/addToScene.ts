import type { PrepPrimitive } from '.';
import { Direction, FlavorType, PrepType } from '@types';

export const AddToSceneOperands = {
	object: FlavorType.Object
} as const;

export const AddToSceneOutputs = {} as const;

export const AddToScenePrep: PrepPrimitive<PrepType.AddToScene> = {
	flavors: {
		object: { directions: [Direction.In], type: FlavorType.Object }
	},
	cook: (scene, _camera, inPayloads) => {
		const object = inPayloads['object'].value;

		scene.add(object);
		return {};
	}
};
