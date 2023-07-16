import { v4 as uuid } from 'uuid';

import * as THREE from 'three';

import { Direction, FlavorType, PrepType, type Flavor, type Prep } from '$types';
import type { InPayloads, PrepPrimitive } from '.';

export const SphereOperands = {
	radius: FlavorType.Number
} as const;
export const SphereOutputs = {
	sphere: FlavorType.Geometry
} as const;

const name = 'sphere';

export const SpherePrep: PrepPrimitive<PrepType.Sphere> = {
	flavors: {
		sphere: { directions: [Direction.Out], type: FlavorType.Geometry, options: null },
		radius: { directions: [Direction.In], type: FlavorType.Number, options: null }
	},
	name,
	create: (prepUuid: string, ingredientUuid: string, direction: Direction) => {
		const sphereFlavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Geometry,
			name: 'sphere',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.Out]
		};
		const radiusFlavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Number,
			name: 'radius',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.In]
		};

		const prep: Prep<PrepType.Sphere> = {
			uuid: prepUuid,
			name,
			ingredientUuid,
			type: PrepType.Sphere,
			// map from default names on prep operands and outputs to flavor uuids
			inFlavorUuidMap: {
				radius: radiusFlavor.uuid
			},
			outFlavorUuidMap: {
				sphere: sphereFlavor.uuid
			},
			direction
		};

		const prepFlavors = [sphereFlavor, radiusFlavor];

		return { prep, prepFlavors };
	},
	cook: (_scene, _camera, inPayloads: InPayloads<PrepType.Sphere>) => {
		const radius = inPayloads['radius'].value;
		const geometry = new THREE.SphereGeometry(radius);

		return {
			sphere: { type: FlavorType.Geometry, value: geometry }
		};
	}
};
