import type { FlavorType, Prisma } from '@prisma/client';
export { FlavorType, type Flavor } from '@prisma/client';

import type { Writable } from 'svelte/store';
import type { Pane } from 'tweakpane';

import { attachColor, type ColorParams } from './color';
import { attachText, type TextParams } from './text';
import { attachNumber, type NumberParams } from './number';
import { attachImage, type ImageParams } from './image';

export const flavorAttaches: {
	[type in FlavorType]: (pane: Pane, store: Writable<Prisma.JsonValue>) => any;
} = {
	number: attachNumber,
	color: attachColor,
	text: attachText,
	image: attachImage
};
