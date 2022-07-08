import type * as THREE from 'three';

import type { PrepPrimitive, FlavorMap } from '.';
import { Direction, FlavorType, type Payload } from '@types';

export interface ShaderOperands extends FlavorMap {}

export interface ShaderOutputs extends FlavorMap {
	shader: FlavorType.Number;
}

export const shader: PrepPrimitive<ShaderOperands, ShaderOutputs> = {
	flavors: {
		shader: { directions: [Direction.Out], type: FlavorType.Number }
	},
	cook: (
		scene: THREE.Scene,
		camera: THREE.Camera,
		inPayloads: {
			[prepOperandName: string]: Payload<FlavorType>;
			// [prepOperandName in keyof ShaderOperands]: Payload<ShaderOperands[prepOperandName]>;
		}
	) => {
		const value = 0;
		return {
			shader: { type: FlavorType.Number, value }
		};
	}
};
