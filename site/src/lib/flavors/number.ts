import { get, type Writable } from 'svelte/store';
import type { Pane } from 'tweakpane';

import { type Flavor, FlavorType } from '.';

export interface NumberParams {
	number: number;
}

export interface NumberFlavor extends Flavor {
	type: FlavorType.Number;
	initial: NumberParams;
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

	let numberInput = pane.addInput(params, 'number').on('change', (ev) => {
		store.set({
			number: ev.value
		});
	});

	return {
		number: numberInput
	};
}
