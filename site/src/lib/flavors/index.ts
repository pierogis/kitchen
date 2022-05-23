import { FlavorType } from '@prisma/client';
export { type Flavor } from '@prisma/client';

import type { Writable } from 'svelte/store';

import type { BladeApi, Pane } from 'tweakpane';
import type { BladeController, View } from '@tweakpane/core';

import { attachColor, type ColorParams } from './color';
import { attachText, type TextParams } from './text';
import { attachNumber, type NumberParams } from './number';
import { attachImage, type ImageParams } from './image';

export function attachControls(
	pane: Pane,
	flavorType: FlavorType,
	parameters: Writable<any>
): () => void {
	let inputs: { [inputName: string]: BladeApi<BladeController<View>> };
	switch (flavorType) {
		case FlavorType.Color:
			inputs = attachColor(pane, parameters);
			break;

		case FlavorType.Image:
			inputs = attachImage(pane, parameters);
			break;

		case FlavorType.Number:
			attachNumber(pane, parameters);
			break;

		case FlavorType.Text:
			attachText(pane, parameters);
			break;

		default:
			console.error('flavorType must be member of FlavorType');
			break;
	}

	return () => {
		Object.entries(inputs).forEach(([inputName, input]) => {
			pane.remove(input);
		});
	};
}
