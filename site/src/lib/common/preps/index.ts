import { Direction, PrepType, FlavorType } from '@types';
import { image } from './image';
import { shader } from './shader';
import { texture } from './texture';

export interface PrepPrimitive {
	flavors: { [prepFlavorName: string]: { directions: Direction[]; type: FlavorType } };
	cook: (parameters: any) => any;
}

export const prepPrimitives: {
	[prepType in PrepType]: PrepPrimitive;
} = {
	[PrepType.Image]: image,
	[PrepType.Shader]: shader,
	[PrepType.Texture]: texture
};
