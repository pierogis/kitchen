import type { Writable } from 'svelte/store';
import type { Pane } from 'tweakpane';

import { attachColor, type ColorParams } from './color';
import { attachText, type TextParams } from './text';
import { attachNumber, type NumberParams } from './number';
import { attachImage, type ImageParams } from './image';

import type { Direction } from '$lib/common/types';

export enum FlavorType {
	number = 'number',
	color = 'color',
	text = 'text',
	image = 'image'
}

export interface Flavor {
	name: string;
	type: FlavorType;
	directions: Direction[];
	initial: any;
	options?: any;
}

export const flavorAttaches: {
	[type in FlavorType]: (pane: Pane, store: Writable<any>) => any;
} = {
	number: attachNumber,
	color: attachColor,
	text: attachText,
	image: attachImage
};
