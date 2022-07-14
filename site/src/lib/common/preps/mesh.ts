import type { PrepPrimitive } from '.';
import { Direction, FlavorType, PrepType } from '@types';
import { Mesh } from 'three';

export const MeshOperands = {
	geometry: FlavorType.Geometry,
	material: FlavorType.Material
} as const;

export const MeshOutputs = {
	mesh: FlavorType.Object
} as const;

export const MeshPrep: PrepPrimitive<PrepType.Mesh> = {
	flavors: {
		mesh: { directions: [Direction.Out], type: FlavorType.Object },
		geometry: { directions: [Direction.In], type: FlavorType.Geometry },
		material: { directions: [Direction.In], type: FlavorType.Material }
	},
	cook: (_scene, _camera, inPayloads) => {
		const geometry = inPayloads['geometry'].value;

		const mesh = new Mesh(geometry);

		return { mesh: { type: FlavorType.Object, value: mesh } };
	}
};
