import { get, type Writable } from 'svelte/store';
import type { Pane } from 'tweakpane';

export interface NumberParams {
	number: number;
}

export function attachNumber(pane: Pane, store: Writable<NumberParams>) {
	let params: NumberParams = get(store);

	let fired = false;

	store.subscribe((newParams) => {
		if (fired) {
			params = newParams;
		}
		fired = true;
	});

	const numberInput = pane.addInput(params, 'number').on('change', (ev) => {
		store.set({
			number: ev.value
		});
	});

	return {
		number: numberInput
	};
}
