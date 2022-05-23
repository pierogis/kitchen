import { get, type Writable } from 'svelte/store';
import type { Pane } from 'tweakpane';

export interface AudioParams {
	audio: HTMLImageElement;
}

export function attachAudio(pane: Pane, store: Writable<AudioParams>) {
	let params: AudioParams = get(store);

	let fired = false;

	store.subscribe((newParams) => {
		if (fired) {
			params = newParams;
		}
		fired = true;
	});

	const textInput = pane.addInput(params, 'audio').on('change', (ev) => {
		store.set({
			audio: ev.value
		});
	});

	return {
		text: textInput
	};
}
