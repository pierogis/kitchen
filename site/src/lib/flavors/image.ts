import { get, type Writable } from 'svelte/store';

import type { Pane, FolderApi, TpChangeEvent } from 'tweakpane';
import * as ImagePlugin from 'tweakpane-image-plugin';

export interface ImageParams {
	image: HTMLImageElement;
	height: number;
	width: number;
}

export function registerImagePlugin(pane: Pane) {
	pane.registerPlugin(ImagePlugin);
}

// export function attachImage(folder: FolderApi, store: Writable<ImageParams>) {
// 	let params: ImageParams = get(store);

// 	let fired = false;

// 	store.subscribe((newParams) => {
// 		if (fired) {
// 			params = newParams;
// 		}
// 		fired = true;
// 	});

// 	const imageInput = folder
// 		.addInput(params, 'image', {
// 			extensions: '.jpg, .png, .gif, .mp4'
// 		})
// 		.on('change', (ev) => {
// 			store.set({
// 				image: ev.value,
// 				width: ev.value.width,
// 				height: ev.value.height
// 			});
// 		});

// 	const widthInput = folder.addMonitor(params, 'width', {
// 		disabled: true,
// 		format: (h) => h.toString()
// 	});

// 	const heightInput = folder.addMonitor(params, 'height', {
// 		disabled: true,
// 		format: (h) => h.toString()
// 	});

// 	return {
// 		image: imageInput,
// 		width: widthInput,
// 		height: heightInput
// 	};
// }

export function imageOnChange(
	paramsStore: Writable<ImageParams>,
	ev: TpChangeEvent<HTMLImageElement>
) {
	paramsStore.set({
		image: ev.value,
		width: ev.value.width,
		height: ev.value.height
	});
}
