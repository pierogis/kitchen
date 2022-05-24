import type { Writable } from 'svelte/store';

import type { Pane, TpChangeEvent } from 'tweakpane';
import * as ImagePlugin from 'tweakpane-image-plugin';

export interface ImageParams {
	image: HTMLImageElement;
	height: number;
	width: number;
}

export function registerImagePlugin(pane: Pane) {
	pane.registerPlugin(ImagePlugin);
}

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
