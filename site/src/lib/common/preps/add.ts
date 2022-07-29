import { v4 as uuid } from 'uuid';

import { Direction, FlavorType, type Flavor, PrepType, type Prep } from '@types';
import type { PrepPrimitive } from '.';

export const AddOperands = {
	operand1: FlavorType.Number,
	operand2: FlavorType.Number
} as const;

export const AddOutputs = {
	sum: FlavorType.Number
} as const;

const name = 'add';

export const AddPrep: PrepPrimitive<PrepType.Add> = {
	flavors: {
		sum: {
			type: FlavorType.Number,
			directions: [Direction.Out],
			options: null
		},
		operand1: {
			type: FlavorType.Number,
			directions: [Direction.In],
			options: null
		},
		operand2: {
			type: FlavorType.Number,
			directions: [Direction.In],
			options: null
		}
	},
	name,
	create: (ingredientUuid: string) => {
		const prepUuid = uuid();
		const sumFlavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Number,
			name: 'sum',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.Out]
		};
		const operand1Flavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Number,
			name: 'operand 1',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.In]
		};
		const operand2Flavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Number,
			name: 'operand 2',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.In]
		};
		const prep: Prep<PrepType.Add> = {
			uuid: prepUuid,
			name,
			ingredientUuid,
			type: PrepType.Add,
			// map from default names on prep operands and outputs to flavor uuids
			inFlavorUuidMap: {
				operand1: operand1Flavor.uuid,
				operand2: operand2Flavor.uuid
			},
			outFlavorUuidMap: {
				sum: sumFlavor.uuid
			},
			direction: Direction.Out
		};

		const prepFlavors = [sumFlavor, operand1Flavor, operand2Flavor];

		return { prep, prepFlavors };
	},
	cook: (_scene, _camera, inPayloads) => {
		const operand1 = inPayloads['operand1'].value;
		const operand2 = inPayloads['operand2'].value;

		const value = operand1 + operand2;
		return {
			sum: { type: FlavorType.Number, value }
		};
	}
};
