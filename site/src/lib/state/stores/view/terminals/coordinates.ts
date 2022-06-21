import type { Direction } from '@types';
import { get, writable, type Readable, type Writable } from 'svelte/store';

import type { Terminal } from '.';
import type { Coordinates, LiveConnectionState } from '@view';

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
};

export function createTerminalsCoordinates(
	terminals: Readable<Terminal[]>,
	liveConnection: LiveConnectionState
): TerminalsCoordinatesState {
	const coordinates: Map<string, Writable<Coordinates>> = new Map();

	function getCoordinates(connectionUuid: string, direction: Direction): Readable<Coordinates> {
		const store = coordinates.get(connectionUuid + direction);

		if (store) {
			return { subscribe: store.subscribe };
		} else {
			throw `Couldn't find coordinates store for ${connectionUuid} ${direction}`;
		}
	}

	function addTerminal(terminal: Terminal, newCoordinates: Coordinates) {
		const terminalCoordinates = coordinates.get(terminal.connectionUuid + terminal.direction);
		if (!terminalCoordinates) {
			coordinates.set(terminal.connectionUuid + terminal.direction, writable(newCoordinates));
		}
	}
	function getMatchingTerminals(terminal: Terminal) {
		return get(terminals).filter(
			(candidateTerminal) =>
				candidateTerminal.direction == terminal.direction &&
				terminal.flavorType == candidateTerminal.flavorType &&
				terminal.flavorUuid != candidateTerminal.flavorUuid
		);
	}
	function updateCoordinates(
		connectionUuid: string,
		direction: Direction,
		newCoordinates: Coordinates
	) {
		const store = coordinates.get(connectionUuid + direction);
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
				coordinates.delete(terminal.connectionUuid + terminal.direction);
		}
	}
	return {
		getCoordinates,
		getMatchingTerminals,
		addTerminal,
		updateCoordinates,
		deleteTerminal
	};
}
