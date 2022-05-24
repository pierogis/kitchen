import { get, type Writable } from 'svelte/store';
import type { FolderApi, TpChangeEvent } from 'tweakpane';

export interface NumberParams {
	number: number;
}

export function attachNumber(folder: FolderApi, store: Writable<NumberParams>) {
	let params: NumberParams = get(store);

	let fired = false;

	store.subscribe((newParams) => {
		if (fired) {
			params = newParams;
		}
		fired = true;
	});

	const numberInput = folder.addInput(params, 'number').on('change', (ev) => {
		store.set({
			number: ev.value
		});
	});

	return {
		number: numberInput
	};
}

export function numberOnChange(paramsStore: Writable<NumberParams>, ev: TpChangeEvent<number>) {
	paramsStore.set({
		number: ev.value
	});
}
