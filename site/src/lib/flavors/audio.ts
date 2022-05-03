import { get, type Writable } from 'svelte/store';
import type { Pane } from 'tweakpane';
import type { Flavor, FlavorType } from '.';

export interface AudioParams {
	audio: HTMLImageElement;
}

export interface AudioFlavor extends Flavor {
	type: FlavorType.audio;
	initial: AudioParams;
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

	let textInput = pane.addInput(params, 'audio').on('change', (ev) => {
		store.set({
			audio: ev.value
		});
	});

	return {
		text: textInput
	};
}
