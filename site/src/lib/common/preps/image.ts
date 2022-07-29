import { v4 as uuid } from 'uuid';

import { Direction, FlavorType, PrepType, type Flavor, type Prep } from '@types';
import type { PrepPrimitive } from '.';

export const ImageOperands = {
	image: FlavorType.Image
} as const;

export const ImageOutputs = {
	image: FlavorType.Image
} as const;

const name = 'image';

export const ImagePrep: PrepPrimitive<PrepType.Image> = {
	flavors: {
		image: { directions: [Direction.In, Direction.Out], type: FlavorType.Image, options: null }
	},
	name,
	create: (ingredientUuid: string) => {
		const prepUuid = uuid();
		const imageFlavor: Flavor = {
			uuid: uuid(),
			type: FlavorType.Image,
			name: 'image',
			options: null,
			ingredientUuid: ingredientUuid,
			prepUuid: prepUuid,
			directions: [Direction.In, Direction.Out]
		};

		const prep: Prep<PrepType.Image> = {
			uuid: prepUuid,
			name,
			ingredientUuid,
			type: PrepType.Image,
			// map from default names on prep operands and outputs to flavor uuids
			inFlavorUuidMap: {
				image: imageFlavor.uuid
			},
			outFlavorUuidMap: {
				image: imageFlavor.uuid
			},
			direction: Direction.Out
		};

		const prepFlavors = [imageFlavor];

		return { prep, prepFlavors };
	},
	cook: (_scene, _camera, inPayloads) => {
		return { image: { type: FlavorType.Image, value: inPayloads['image'].value } };
	}
};
