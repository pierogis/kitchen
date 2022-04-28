import type { Writable } from 'svelte/store';
import type { Pane } from 'tweakpane';

export function attachColor(
	pane: Pane,
	store: Writable<{ color: { r: number; g: number; b: number } }>
) {
	let params: { color: { r: number; g: number; b: number } };

	store.subscribe((newParams) => {
		params = newParams;
	});

	let colorInput = pane.addInput(params, 'color').on('change', (ev) => {
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
