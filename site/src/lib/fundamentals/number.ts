import type { Writable } from 'svelte/store';
import type { Pane } from 'tweakpane';

export function attachNumber(pane: Pane, store: Writable<{ number: number }>) {
	let params: { number: number };

	store.subscribe((newParams) => {
		params = newParams;
	});

	let numberInput = pane.addInput(params, 'number').on('change', (ev) => {
		store.set({
			number: ev.value
		});
	});

	return {
		number: numberInput
	};
}
