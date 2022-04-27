import { type Writable, writable } from 'svelte/store';

export interface ViewportState {
	width: number;
	height: number;
}

export const viewportStore: Writable<ViewportState> = writable();

export function changeViewport(state: ViewportState) {
	viewportStore.update(() => {
		return state;
	});
}
