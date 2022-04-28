import type { Writable } from 'svelte/store';

import type { Pane } from 'tweakpane';
import * as imagePlugin from 'tweakpane-image-plugin';

export function attachImage(
	pane: Pane,
	store: Writable<{ image: any; height: number; width: number }>
) {
	let params: { image: any; height: number; width: number };

	store.subscribe((newParams) => {
		params = newParams;
	});
	pane.registerPlugin(imagePlugin);
	let imageInput = pane
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

	let widthInput = pane.addMonitor(params, 'width', {
		disabled: true,
		format: (h) => h.toString()
	});

	let heightInput = pane.addMonitor(params, 'height', {
		disabled: true,
		format: (h) => h.toString()
	});

	return {
		image: imageInput,
		width: widthInput,
		height: heightInput
	};
}
