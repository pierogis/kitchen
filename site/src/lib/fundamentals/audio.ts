import type { Writable } from 'svelte/store';
import type { Pane } from 'tweakpane';

export function attachAudio(pane: Pane, store: Writable<{ audio: any }>) {
	let params: { audio: string };

	store.subscribe((newParams) => {
		params = newParams;
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
