import type { Coordinates } from '@types';
import { writable, type Writable } from 'svelte/store';

export type CursorState = {
	coordinates: Writable<Coordinates | undefined>;
};

export function createCursor(): CursorState {
	const coordinates: Writable<Coordinates | undefined> = writable(undefined);

	return { coordinates };
}
