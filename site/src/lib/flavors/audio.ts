import { get, type Writable } from 'svelte/store';
import type { FolderApi } from 'tweakpane';

export interface AudioParams {
	audio: HTMLImageElement;
}

export function attachAudio(folder: FolderApi, store: Writable<AudioParams>) {
	let params: AudioParams = get(store);

	let fired = false;

	store.subscribe((newParams) => {
		if (fired) {
			params = newParams;
		}
		fired = true;
	});

	const textInput = folder.addInput(params, 'audio').on('change', (ev) => {
		store.set({
			audio: ev.value
		});
	});

	return {
		text: textInput
	};
}
