import { v4 as uuid } from 'uuid';

import * as THREE from 'three';

import { Direction, FlavorType, PrepType, type Flavor, type Prep } from '@types';
import type { PrepPrimitive } from '.';

export const MaterialOperands = {
	color: FlavorType.Color
} as const;

export const MaterialOutputs = {
	material: FlavorType.Material
} as const;

const name = 'material';

export const MaterialPrep: PrepPrimitive<PrepType.Material> = {
	flavors: {
		color: { directions: [Direction.In], type: FlavorType.Color, options: null },
		material: { directions: [Direction.Out], type: FlavorType.Material, options: null }
	},
	name,
	create: (ingredientUuid: string) => {
		const prepUuid = uuid();
		const colorFlavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Color,
			name: 'color',
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
			directions: [Direction.Out]
		};

		const prep: Prep<PrepType.Material> = {
			uuid: prepUuid,
			name,
			ingredientUuid,
			type: PrepType.Material,
			// map from default names on prep operands and outputs to flavor uuids
			inFlavorUuidMap: {
				color: colorFlavor.uuid
			},
			outFlavorUuidMap: {
				material: materialFlavor.uuid
			},
			direction: Direction.Out
		};

		const prepFlavors = [colorFlavor, materialFlavor];

		return { prep, prepFlavors };
	},
	cook: (_scene, _camera, inPayloads) => {
		const color = inPayloads['color'].value;
		const value = new THREE.MeshBasicMaterial({ color });

		return {
			material: { type: FlavorType.Material, value }
		};
	}
};
