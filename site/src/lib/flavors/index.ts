import type { FlavorType } from '@prisma/client';
import type { Direction } from '$lib/common/types';
export { FlavorType } from '@prisma/client';

export interface Flavor {
	uuid: string;
	ingredientUuid: string;
	type: FlavorType;
	name: string;
	options: { [optionKey: string]: any } | null;
	directions: Direction[];
}

import type { Pane } from 'tweakpane';
import { registerImagePlugin } from './image';

export function registerPlugins(pane: Pane) {
	registerImagePlugin(pane);
}
