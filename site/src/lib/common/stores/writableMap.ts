import { writable, type Writable } from 'svelte/store';

export interface WritableMap<K, T> extends Writable<Map<K, T>> {
	add: (key: K, value: T) => T;
	updateEntry: (key: K, value: T) => T;
	delete: (key: K) => void;
}

export function writableMap<K, T>(initial?: Map<K, T>): WritableMap<K, T> {
	const store: Writable<Map<K, T>> = writable(initial || new Map());

	return {
		subscribe: store.subscribe,
		set: store.set,
		update: store.update,
		add: (key: K, value: T): T => {
			store.update((currentMap) => {
				currentMap.set(key, value);
				return currentMap;
			});

			return value;
		},
		updateEntry: (key: K, value: T): T => {
			store.update((currentMap) => {
				currentMap.set(key, value);

				return currentMap;
			});

			return value;
		},
		delete: (key: K) => {
			store.update((currentMap) => {
				currentMap.delete(key);

				return currentMap;
			});
		}
	};
}
