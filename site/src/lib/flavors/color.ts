import { get, type Writable } from 'svelte/store';
import type { Pane } from 'tweakpane';

export interface ColorParams {
	color: { r: number; g: number; b: number };
}

export function attachColor(pane: Pane, store: Writable<ColorParams>) {
	let params: ColorParams = get(store);

	let fired = false;

	store.subscribe((newParams) => {
		if (fired) {
			params = newParams;
		}
		fired = true;
	});

	const colorInput = pane.addInput(params, 'color').on('change', (ev) => {
		store.set({
			color: {
				r: ev.value.r,
				g: ev.value.g,
				b: ev.value.b
			}
		});
	});

	return {
		color: colorInput
	};
}
