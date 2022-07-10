import type * as THREE from 'three';

import { Direction, FlavorType, type Payload } from '@types';
import type { FlavorMap, PrepPrimitive } from '.';

export interface AddOperands extends FlavorMap {
	'operand 1': FlavorType.Number;
	'operand 2': FlavorType.Number;
}

export interface AddOutputs extends FlavorMap {
	sum: FlavorType.Number;
}

export const AddPrep: PrepPrimitive<AddOperands, AddOutputs> = {
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
	cook: (
		_scene: THREE.Scene,
		_camera: THREE.Camera,
		inPayloads: {
			[prepOperandName: string]: Payload<FlavorType>;
		}
	) => {
		const operand1 = Number(inPayloads['operand 1'].value);
		const operand2 = Number(inPayloads['operand 1'].value);

		const value = operand1 + operand2;
		return {
			sum: { type: FlavorType.Number, value }
		};
	}
};
