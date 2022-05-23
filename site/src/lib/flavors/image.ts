import { get, type Writable } from 'svelte/store';

import type { Pane } from 'tweakpane';
import * as ImagePlugin from 'tweakpane-image-plugin';

export interface ImageParams {
	image: HTMLImageElement;
	height: number;
	width: number;
}

export function attachImage(pane: Pane, store: Writable<ImageParams>) {
	let params: ImageParams = get(store);

	let fired = false;

	store.subscribe((newParams) => {
		if (fired) {
			params = newParams;
		}
		fired = true;
	});

	pane.registerPlugin(ImagePlugin);
	console.log(params);
	const imageInput = pane
		.addInput(params, 'image', {
			extensions: '.jpg, .png, .gif, .mp4'
		})
		.on('change', (ev) => {
			store.set({
				image: ev.value,
				width: ev.value.width,
				height: ev.value.height
			});
		});

	const widthInput = pane.addMonitor(params, 'width', {
		disabled: true,
		format: (h) => h.toString()
	});

	const heightInput = pane.addMonitor(params, 'height', {
		disabled: true,
		format: (h) => h.toString()
	});

	return {
		image: imageInput,
		width: widthInput,
		height: heightInput
	};
}
