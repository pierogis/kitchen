import { get, type Writable } from 'svelte/store';
import type { FolderApi, TpChangeEvent } from 'tweakpane';

export interface TextParams {
	text: string;
}

export function attachText(folder: FolderApi, store: Writable<TextParams>) {
	let params: TextParams = get(store);

	let fired = false;

	store.subscribe((newParams) => {
		if (fired) {
			params = newParams;
		}
		fired = true;
	});

	const textInput = folder.addInput(params, 'text').on('change', (ev) => {
		store.set({
			text: ev.value
		});
	});

	return {
		text: textInput
	};
}

export function textOnChange(paramsStore: Writable<TextParams>, ev: TpChangeEvent<string>) {
	paramsStore.set({
		text: ev.value
	});
}
