import type { Coordinates } from '$types';
import { writable, type Writable } from 'svelte/store';

export type CursorState = {
	coordinates: Writable<Coordinates>;
};

export function createCursor(): CursorState {
	const coordinates: Writable<Coordinates> = writable({ x: 0, y: 0 });

	return { coordinates };
}
