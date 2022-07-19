import { Direction, FlavorType, PrepType } from '@types';
import type { PrepPrimitive } from '.';

export const AddOperands = {
	'operand 1': FlavorType.Number,
	'operand 2': FlavorType.Number
} as const;

export const AddOutputs = {
	sum: FlavorType.Number
} as const;

export const AddPrep: PrepPrimitive<PrepType.Add> = {
	flavors: {
		sum: {
			type: FlavorType.Number,
			directions: [Direction.Out]
		},
		'operand 1': {
			type: FlavorType.Number,
			directions: [Direction.In]
		},
		'operand 2': {
			type: FlavorType.Number,
			directions: [Direction.In]
		}
	},
	cook: (_scene, _camera, inPayloads) => {
		const operand1 = inPayloads['operand 1'].value;
		const operand2 = inPayloads['operand 2'].value;

		const value = operand1 + operand2;
		return {
			sum: { type: FlavorType.Number, value }
		};
	}
};
