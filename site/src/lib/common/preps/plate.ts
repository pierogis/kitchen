import { v4 as uuid } from 'uuid';

import * as THREE from 'three';

import { Direction, FlavorType, PrepType, type Flavor, type Prep } from '@types';
import type { PrepPrimitive } from '.';

export const PlateOperands = {
	object: FlavorType.Object
} as const;

export const PlateOutputs = {
	plate: FlavorType.Object
} as const;

const name = 'plate';

export const PlatePrep: PrepPrimitive<PrepType.Plate> = {
	flavors: {
		plate: { directions: [Direction.Out], type: FlavorType.Object, options: null },
		object: { directions: [Direction.In], type: FlavorType.Object, options: null }
	},
	name,
	create: (prepUuid: string, ingredientUuid: string) => {
		const plateFlavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Object,
			name: 'plate',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.Out]
		};
		const objectFlavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Object,
			name: 'object',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.In]
		};

		const prep: Prep<PrepType.Plate> = {
			uuid: prepUuid,
			name,
			ingredientUuid,
			type: PrepType.Plate,
			// map from default names on prep operands and outputs to flavor uuids
			inFlavorUuidMap: {
				object: objectFlavor.uuid
			},
			outFlavorUuidMap: {
				plate: plateFlavor.uuid
			},
			direction: Direction.Out
		};

		const prepFlavors = [objectFlavor, plateFlavor];

		return { prep, prepFlavors };
	},
	cook: (scene, _camera, inPayloads) => {
		const object = inPayloads['object'].value;

		scene.add(object);

		const value = new THREE.Scene();
		value.add(object.clone());

		return {
			plate: { type: FlavorType.Object, value }
		};
	}
};
