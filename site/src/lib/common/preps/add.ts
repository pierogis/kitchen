import { Direction, FlavorType } from '@types';
import type { PrepPrimitive } from '.';

export const add: PrepPrimitive = {
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
	cook: (parameters: { 'operand 1': number; 'operand 2': number }) => {
		return {
			sum: parameters['operand 1'] + parameters['operand 2']
		};
	}
};
