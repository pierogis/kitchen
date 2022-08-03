import { v4 as uuid } from 'uuid';

import * as THREE from 'three';

import { Direction, FlavorType, PrepType, type Flavor, type Prep } from '@types';
import type { PrepPrimitive } from '.';

export const MeshOperands = {
	geometry: FlavorType.Geometry,
	material: FlavorType.Material
} as const;

export const MeshOutputs = {
	mesh: FlavorType.Object
} as const;

const name = 'mesh';

export const MeshPrep: PrepPrimitive<PrepType.Mesh> = {
	flavors: {
		mesh: { directions: [Direction.Out], type: FlavorType.Object, options: null },
		geometry: { directions: [Direction.In], type: FlavorType.Geometry, options: null },
		material: { directions: [Direction.In], type: FlavorType.Material, options: null }
	},
	name,
	create: (prepUuid: string, ingredientUuid: string) => {
		const meshFlavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Object,
			name: 'mesh',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.Out]
		};
		const geometryFlavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Geometry,
			name: 'geometry',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.In]
		};
		const materialFlavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Material,
			name: 'material',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.In]
		};

		const prep: Prep<PrepType.Mesh> = {
			uuid: prepUuid,
			name,
			ingredientUuid,
			type: PrepType.Mesh,
			// map from default names on prep operands and outputs to flavor uuids
			inFlavorUuidMap: {
				geometry: geometryFlavor.uuid,
				material: materialFlavor.uuid
			},
			outFlavorUuidMap: {
				mesh: meshFlavor.uuid
			},
			direction: Direction.Out
		};

		const prepFlavors = [meshFlavor, geometryFlavor, materialFlavor];

		return { prep, prepFlavors };
	},
	cook: (_scene, _camera, inPayloads) => {
		const geometry = inPayloads['geometry'].value;
		const material = inPayloads['material'].value;

		const mesh = new THREE.Mesh(geometry, material);

		return { mesh: { type: FlavorType.Object, value: mesh } };
	}
};
