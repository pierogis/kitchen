import { Direction, FlavorType, type Flavor } from '@prisma/client';
export { type Flavor } from '@prisma/client';

import { writable, type Writable } from 'svelte/store';

import type { BladeApi, Pane } from 'tweakpane';
import type { BladeController, FolderApi, View } from '@tweakpane/core';

import { attachColor, type ColorParams } from './color';
import { attachText, type TextParams } from './text';
import { attachNumber, type NumberParams } from './number';
import { registerImagePlugin, type ImageParams } from './image';

export function registerPlugins(pane: Pane) {
	registerImagePlugin(pane);
}

// export function attachControls(
// 	folder: FolderApi,
// 	flavor: Flavor,
// 	terminalRackContainers: {
// 		[direction in Direction]: { [flavorName: string]: HTMLElement };
// 	}
// ): () => void {
// 	let parameterBlades: { [inputName: string]: BladeApi<BladeController<View>> };
// 	switch (flavor.type) {
// 		case FlavorType.Color:
// 			const colorParameters: ColorParams = {
// 				color: flavor.parameters['color']
// 			};
// 			parameterBlades = attachColor(folder, writable(colorParameters));
// 			break;

// 		case FlavorType.Image:
// 			const imageParameters: ImageParams = {
// 				image: flavor.parameters['image'],
// 				height: flavor.parameters['height'],
// 				width: flavor.parameters['width']
// 			};
// 			parameterBlades = attachImage(folder, writable(imageParameters));
// 			break;

// 		case FlavorType.Number:
// 			const numberParameters: NumberParams = {
// 				number: flavor.parameters['number']
// 			};
// 			parameterBlades = attachNumber(folder, writable(numberParameters));
// 			break;

// 		case FlavorType.Text:
// 			const textParameters: TextParams = {
// 				text: flavor.parameters['text']
// 			};
// 			parameterBlades = attachText(folder, writable(textParameters));
// 			break;

// 		default:
// 			console.error('flavorType must be member of FlavorType');
// 			break;
// 	}

// 	Object.entries(parameterBlades).forEach(([flavorName, parameterBlade]) => {
// 		parameterBlade.controller_.view.element.parentElement.style.width = '100px';

// 		if (Direction.In in flavor.directions) {
// 			parameterBlade.controller_.view.element.prepend(terminalRackContainers.In[flavorName]);
// 		}

// 		if (Direction.Out in flavor.directions) {
// 			parameterBlade.controller_.view.element.append(terminalRackContainers.Out[flavorName]);
// 		}
// 	});

// 	return () => {
// 		Object.entries(parameterBlades).forEach(([inputName, parameterBlade]) => {
// 			folder.remove(parameterBlade);
// 		});
// 	};
// }
