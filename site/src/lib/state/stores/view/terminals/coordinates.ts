import { Direction } from '@types';
import { derived, get, writable, type Readable, type Writable } from 'svelte/store';

import type { Coordinates } from '@types';
import type { LiveConnectionState } from '@view';
import type { Terminal } from '.';

export type TerminalsCoordinatesState = {
	getCoordinates: (connectionUuid: string, direction: Direction) => Readable<Coordinates>;
	getMatchingTerminals: (terminal: Terminal) => Terminal[];
	addTerminal: (terminal: Terminal, newCoordinates: Coordinates) => void;
	updateCoordinates: (
		connectionUuid: string,
		direction: Direction,
		newCoordinates: Coordinates
	) => void;
	deleteTerminal: (terminal: Terminal) => void;
	hasConnectionCoordinates: (connectionUuid: string) => Readable<boolean>;
};

function coordinatesStoresMap(): {
	set(connectionUuid: string, direction: Direction, coordinates: Writable<Coordinates>): void;
	get(connectionUuid: string, direction: Direction): Writable<Coordinates> | undefined;
	delete(connectionUuid: string, direction: Direction): void;
	has(connectionUuid: string, direction: Direction): Readable<boolean>;
	hasConnection(connectionUuid: string): Readable<boolean>;
} {
	const map: Map<string, Writable<Coordinates>> = new Map();
	const keys: Writable<Set<string>> = writable(new Set());

	function set(connectionUuid: string, direction: Direction, coordinates: Writable<Coordinates>) {
		const key = connectionUuid + direction;
		map.set(key, coordinates);
		keys.update((keys) => keys.add(key));

		return map;
	}

	function get(connectionUuid: string, direction: Direction) {
		const key = connectionUuid + direction;
		return map.get(key);
	}

	function del(connectionUuid: string, direction: Direction) {
		const key = connectionUuid + direction;
		const exists = map.delete(key);
		if (exists) {
			keys.update((keys) => {
				keys.delete(key);
				return keys;
			});
		}

		return exists;
	}

	function has(connectionUuid: string, direction: Direction) {
		const key = connectionUuid + direction;
		return derived(keys, ($keys) => $keys.has(key));
	}
	function hasConnection(connectionUuid: string) {
		const hasIn = has(connectionUuid, Direction.In);
		const hasOut = has(connectionUuid, Direction.In);
		return derived([hasIn, hasOut], ([$hasIn, $hasOut]) => $hasIn && $hasOut);
	}

	return {
		...map,
		set,
		get,
		delete: del,
		has,
		hasConnection
	};
}

export function createTerminalsCoordinates(
	terminals: Readable<Terminal[]>,
	liveConnection: LiveConnectionState
): TerminalsCoordinatesState {
	const stores = coordinatesStoresMap();

	function getCoordinates(connectionUuid: string, direction: Direction): Readable<Coordinates> {
		const store = stores.get(connectionUuid, direction);

		if (store) {
			return { subscribe: store.subscribe };
		} else {
			throw `coordinates store for ${connectionUuid} ${direction} not found`;
		}
	}

	function addTerminal(terminal: Terminal, newCoordinates: Coordinates) {
		const store = stores.get(terminal.connectionUuid, terminal.direction);
		if (!store) {
			stores.set(terminal.connectionUuid, terminal.direction, writable(newCoordinates));
		}
	}
	function getMatchingTerminals(terminal: Terminal) {
		return get(terminals).filter(
			(candidateTerminal) =>
				candidateTerminal.direction == terminal.direction &&
				terminal.flavorType == candidateTerminal.flavorType &&
				candidateTerminal.flavorUuid
		);
	}
	function updateCoordinates(
		connectionUuid: string,
		direction: Direction,
		newCoordinates: Coordinates
	) {
		const store = stores.get(connectionUuid, direction);
		store?.set(newCoordinates);
	}
	function deleteTerminal(terminal: Terminal) {
		// this function is called when Terminals die
		// if the terminal still exists (live terminal died), don't delete
		const existingTerminal = get(terminals).find(
			(existingTerminal) =>
				terminal.connectionUuid == existingTerminal.connectionUuid &&
				terminal.direction == existingTerminal.direction
		);
		if (!existingTerminal) {
			// also don't delete if the live terminal is using the terminal that died
			const currentLiveConnection = get(liveConnection);
			if (
				currentLiveConnection?.connectionUuid != terminal.connectionUuid ||
				currentLiveConnection.dragDirection != terminal.direction
			)
				stores.delete(terminal.connectionUuid, terminal.direction);
		}
	}
	return {
		getCoordinates,
		getMatchingTerminals,
		addTerminal,
		updateCoordinates,
		deleteTerminal,
		hasConnectionCoordinates: (connectionUuid: string) => stores.hasConnection(connectionUuid)
	};
}
