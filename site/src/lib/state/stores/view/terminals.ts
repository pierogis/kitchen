import { derived, get, writable, type Readable, type Writable } from 'svelte/store';
import { v4 as uuid } from 'uuid';

import { Direction, FlavorType, type Connection, type Flavor } from '$lib/common/types';

import type { Coordinates } from '.';

import type { LiveConnectionState } from './liveConnection';

export const terminalHeight = 10;

export type Terminal = {
	flavorUuid?: string;
	direction: Direction;
	connectionUuid: string;
	cabled: boolean;
	flavorType: FlavorType;
};

export type TerminalCoordinatesState = {
	getCoordinates: (connectionUuid: string, direction: Direction) => Readable<Coordinates>;
	getMatchingTerminals: (terminal: Terminal) => Terminal[];
	addTerminal: (terminal: Terminal, newCoordinates: Coordinates) => void;
	updateCoordinates: (terminal: Terminal, newCoordinates: Coordinates) => void;
	deleteTerminal: (terminal: Terminal) => void;
};

export function createTerminalCoordinates(
	terminals: Readable<Terminal[]>,
	liveConnection: LiveConnectionState
): TerminalCoordinatesState {
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
		if (terminalCoordinates) {
			terminalCoordinates.set(newCoordinates);
		} else {
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
	function updateCoordinates(terminal: Terminal, newCoordinates: Coordinates) {
		const store = coordinates.get(terminal.connectionUuid + terminal.direction);
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

export function createTerminals(
	focusedConnections: Readable<Connection[]>,
	focusedFlavors: Readable<Flavor[]>,
	liveConnection: LiveConnectionState
): Readable<Terminal[]> {
	const flavorNovelConnectionUuids: Map<string, string> = new Map();
	// track connectionIds that have already been used
	const usedInFlavorUuids: Set<string> = new Set();

	const connectedTerminals: Readable<Terminal[]> = derived(
		[focusedConnections, liveConnection],
		([currentFocusedConnections, currentLiveConnection]) => {
			// track connectionIds that have already been used
			usedInFlavorUuids.clear();

			const terminals: Terminal[] = currentFocusedConnections.flatMap((connection) => {
				// change in connection based terminals could mean the current novel uuid has been used
				if (flavorNovelConnectionUuids.has(connection.inFlavorUuid + Direction.In)) {
					flavorNovelConnectionUuids.delete(connection.inFlavorUuid + Direction.In);
				}
				if (flavorNovelConnectionUuids.has(connection.outFlavorUuid + Direction.Out)) {
					flavorNovelConnectionUuids.delete(connection.outFlavorUuid + Direction.Out);
				}

				usedInFlavorUuids.add(connection.inFlavorUuid);
				return [
					{
						flavorUuid: connection.inFlavorUuid,
						direction: Direction.In,
						connectionUuid: connection.uuid,
						cabled: true,
						flavorType: connection.flavorType
					},
					{
						flavorUuid: connection.outFlavorUuid,
						direction: Direction.Out,
						connectionUuid: connection.uuid,
						cabled: true,
						flavorType: connection.flavorType
					}
				];
			});

			// maintain terminal for live anchored flavor
			if (currentLiveConnection) {
				if (
					flavorNovelConnectionUuids.has(
						currentLiveConnection.anchorFlavorUuid + currentLiveConnection.anchorDirection
					)
				) {
					flavorNovelConnectionUuids.delete(
						currentLiveConnection.anchorFlavorUuid + currentLiveConnection.anchorDirection
					);
				}
				usedInFlavorUuids.add(currentLiveConnection.anchorFlavorUuid);

				terminals.push({
					flavorUuid: currentLiveConnection.anchorFlavorUuid,
					direction: currentLiveConnection.anchorDirection,
					connectionUuid: currentLiveConnection.connectionUuid,
					cabled: true,
					flavorType: currentLiveConnection.flavorType
				});
			}

			return terminals;
		}
	);

	const novelTerminals: Readable<Terminal[]> = derived(
		[focusedFlavors, connectedTerminals, liveConnection],
		([currentFocusedFlavors, currentConnectedTerminals, currentLiveConnection]) => {
			const novelTerminals = [];
			// maintain terminal for a disconnected flavor
			if (currentLiveConnection && currentLiveConnection.disconnectedFlavorUuid) {
				novelTerminals.push({
					flavorUuid: currentLiveConnection.disconnectedFlavorUuid,
					direction: currentLiveConnection.dragDirection,
					connectionUuid: uuid(),
					cabled: false,
					flavorType: currentLiveConnection.flavorType
				});
			}

			// creating novel terminals for each flavor
			currentFocusedFlavors.forEach((flavor) => {
				flavor.directions.forEach((direction) => {
					// don't create a novel terminal in place of the live connection's disconnected terminal
					if (
						currentLiveConnection?.disconnectedFlavorUuid != flavor.uuid ||
						currentLiveConnection?.dragDirection != direction
					) {
						// there should only be one in terminal on each flavor
						if (
							!currentConnectedTerminals.find(
								(terminal) =>
									terminal.flavorUuid == flavor.uuid && terminal.direction == Direction.In
							) &&
							direction == Direction.In
						) {
							// preserve the flavor's novel connection uuids
							let inNovelConnectionUuid = flavorNovelConnectionUuids.get(
								flavor.uuid + Direction.In
							);

							// make a new one if it doesnt exist
							if (!inNovelConnectionUuid) {
								inNovelConnectionUuid = uuid();
								flavorNovelConnectionUuids.set(flavor.uuid + Direction.In, inNovelConnectionUuid);
							}

							novelTerminals.push({
								flavorUuid: flavor.uuid,
								direction: Direction.In,
								connectionUuid: inNovelConnectionUuid,
								cabled: false,
								flavorType: flavor.type
							});
						} else {
							// do the same for out terminal
							let outNovelConnectionUuid = flavorNovelConnectionUuids.get(
								flavor.uuid + Direction.Out
							);
							if (!outNovelConnectionUuid) {
								outNovelConnectionUuid = uuid();
								flavorNovelConnectionUuids.set(flavor.uuid + Direction.Out, outNovelConnectionUuid);
							}

							novelTerminals.push({
								flavorUuid: flavor.uuid,
								direction: Direction.Out,
								connectionUuid: outNovelConnectionUuid,
								cabled: false,
								flavorType: flavor.type
							});
						}
					}
				});
			});

			return novelTerminals;
		}
	);

	return derived(
		[connectedTerminals, novelTerminals],
		([currentConnectedTerminals, currentNovelTerminals]) =>
			currentConnectedTerminals.concat(currentNovelTerminals)
	);
}
