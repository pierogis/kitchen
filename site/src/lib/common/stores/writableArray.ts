import { get, writable, type Writable } from 'svelte/store';

export type WritableArray<T> = Writable<T[]> & {
	push: (value: T) => void;
	pop: () => T | undefined;
	length: () => number;
};

export function writableArray<T>(inital?: T[]): WritableArray<T> {
	const store: Writable<T[]> = writable(inital || []);
	return {
		set: store.set,
		update: store.update,
		subscribe: store.subscribe,

		push: (value: T) => {
			store.update((array) => {
				array.push(value);
				return array;
			});
		},
		pop: () => {
			let value: T | undefined;
			store.update((array) => {
				value = array.pop();
				return array;
			});
			return value;
		},
		length: () => {
			return get(store).length;
		}
	};
}
