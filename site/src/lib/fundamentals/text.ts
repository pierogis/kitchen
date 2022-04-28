import type { Writable } from 'svelte/store';
import type { Pane } from 'tweakpane';

export function attachText(pane: Pane, store: Writable<{ text: string }>) {
	let params: { text: string };

	store.subscribe((newParams) => {
		params = newParams;
	});

	let textInput = pane.addInput(params, 'text').on('change', (ev) => {
		store.set({
			text: ev.value
		});
	});

	return {
		text: textInput
	};
}
