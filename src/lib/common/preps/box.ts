import { v4 as uuid } from 'uuid';

import * as THREE from 'three';

import { Direction, FlavorType, PrepType, type Flavor, type Prep } from '$types';
import type { InPayloads, PrepPrimitive } from '.';

export const BoxOperands = {
	width: FlavorType.Number,
	height: FlavorType.Number,
	depth: FlavorType.Number
} as const;
export const BoxOutputs = {
	box: FlavorType.Geometry
} as const;

const name = 'box';

export const BoxPrep: PrepPrimitive<PrepType.Box> = {
	flavors: {
		box: { directions: [Direction.Out], type: FlavorType.Geometry, options: null },
		width: { directions: [Direction.In], type: FlavorType.Number, options: null },
		height: { directions: [Direction.In], type: FlavorType.Number, options: null },
		depth: { directions: [Direction.In], type: FlavorType.Number, options: null }
	},
	name,
	create: (prepUuid: string, ingredientUuid: string, direction: Direction) => {
		const boxFlavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Geometry,
			name: 'box',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.Out]
		};
		const xFlavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Number,
			name: 'width',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.In]
		};
		const yFlavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Number,
			name: 'height',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.In]
		};
		const zFlavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Number,
			name: 'depth',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.In]
		};

		const prep: Prep<PrepType.Box> = {
			uuid: prepUuid,
			name,
			ingredientUuid,
			type: PrepType.Box,
			// map from default names on prep operands and outputs to flavor uuids
			inFlavorUuidMap: {
				width: xFlavor.uuid,
				height: yFlavor.uuid,
				depth: zFlavor.uuid
			},
			outFlavorUuidMap: {
				box: boxFlavor.uuid
			},
			direction
		};

		const prepFlavors = [boxFlavor, xFlavor, yFlavor, zFlavor];

		return { prep, prepFlavors };
	},
	cook: (_scene, _camera, inPayloads: InPayloads<PrepType.Box>) => {
		const width = inPayloads['width'].value;
		const height = inPayloads['height'].value;
		const depth = inPayloads['depth'].value;
		const geometry = new THREE.BoxGeometry(width, height, depth);

		return {
			box: { type: FlavorType.Geometry, value: geometry }
		};
	}
};
