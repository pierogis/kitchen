import { get, type Writable } from 'svelte/store';
import type { Pane } from 'tweakpane';

export interface TextParams {
	text: string;
}

export function attachText(pane: Pane, store: Writable<TextParams>) {
	let params: TextParams = get(store);

	let fired = false;

	store.subscribe((newParams) => {
		if (fired) {
			params = newParams;
		}
		fired = true;
	});

	const textInput = pane.addInput(params, 'text').on('change', (ev) => {
		store.set({
			text: ev.value
		});
	});

	return {
		text: textInput
	};
}
