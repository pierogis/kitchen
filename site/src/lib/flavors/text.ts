import { get, type Writable } from 'svelte/store';
import type { Pane } from 'tweakpane';

import type { Flavor, FlavorType } from '.';

export interface TextParams {
	text: string;
}

export interface TextFlavor extends Flavor {
	type: FlavorType.text;
	initial: TextParams;
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

	let textInput = pane.addInput(params, 'text').on('change', (ev) => {
		store.set({
			text: ev.value
		});
	});

	return {
		text: textInput
	};
}
