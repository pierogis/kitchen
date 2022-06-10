import type { Writable } from 'svelte/store';

import type { Pane, TpChangeEvent } from 'tweakpane';

export interface ImageParams {
	image: HTMLImageElement;
}

export function registerImagePlugin(pane: Pane) {
	// pane.registerPlugin(ImagePlugin);
}

export function imageOnChange(
	paramsStore: Writable<ImageParams>,
	ev: TpChangeEvent<HTMLImageElement>
) {
	paramsStore.set({
		image: ev.value
	});
}
