import { Direction, FlavorType } from '@types';
import type { Prep } from '.';

export const add: Prep = {
	flavors: [
		{
			name: 'sum',
			type: FlavorType.Number,
			directions: [Direction.Out],
			options: null
		},
		{
			name: 'operand 1',
			type: FlavorType.Number,
			directions: [Direction.In],
			options: null
		},
		{
			name: 'operand 2',
			type: FlavorType.Number,
			directions: [Direction.In],
			options: null
		}
	],
	cook: (parameters: { 'operand 1': number; 'operand 2': number }) => {
		return {
			sum: parameters['operand 1'] + parameters['operand 2']
		};
	}
};
