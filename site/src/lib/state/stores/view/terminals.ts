import { derived, writable, type Readable, type Writable } from 'svelte/store';
import { v4 as uuid } from 'uuid';

import {
	Direction,
	FlavorType,
	type Connection,
	type Flavor,
	type Ingredient
} from '$lib/common/types';

import type { Coordinates } from '.';

import type { LiveConnectionState } from './liveConnection';
import type { RecipeState } from '../recipe';

export const terminalHeight = 10;

export type Terminal = {
	flavorUuid?: string;
	direction: Direction;
	connectionUuid: string;
	cabled: boolean;
	flavorType: FlavorType;
};

export type TerminalCoordinatesState = {
	getCoordinates: (
		connectionUuid: string,
		direction: Direction
	) => Readable<Coordinates | undefined>;
	getMatchingTerminals: (terminal: Terminal) => Terminal[];
	addTerminal: (terminal: Terminal, newCoordinates: Coordinates) => void;
	updateCoordinates: (terminal: Terminal, newCoordinates: Coordinates) => void;
	deleteTerminal: (terminal: Terminal) => void;
};

export function createTerminalCoordinates(): TerminalCoordinatesState {
	const coordinates: Writable<Map<string, Coordinates>> = writable(new Map());
	const terminals: Map<string, Terminal> = new Map();

	function getCoordinates(
		connectionUuid: string,
		direction: Direction
	): Readable<Coordinates | undefined> {
		return derived(coordinates, (currentCoordinates) =>
			currentCoordinates.get(connectionUuid + direction)
		);
	}

	function addTerminal(terminal: Terminal, newCoordinates: Coordinates) {
		terminals.set(terminal.connectionUuid + terminal.direction, terminal);
		coordinates.update((currentCoordinates) =>
			currentCoordinates.set(terminal.connectionUuid + terminal.direction, newCoordinates)
		);
	}
	function getMatchingTerminals(terminal: Terminal) {
		return Array.from(terminals.values()).filter(
			(candidateTerminal) =>
				candidateTerminal.direction == terminal.direction &&
				terminal.flavorType == candidateTerminal.flavorType &&
				terminal.flavorUuid != candidateTerminal.flavorUuid
		);
	}
	function updateCoordinates(terminal: Terminal, newCoordinates: Coordinates) {
		coordinates.update((currentCoordinates) => {
			currentCoordinates.set(terminal.connectionUuid + terminal.direction, newCoordinates);
			return currentCoordinates;
		});
	}
	function deleteTerminal(terminal: Terminal) {
		terminals.delete(terminal.connectionUuid + terminal.direction);
		coordinates.update((currentCoordinates) => {
			currentCoordinates.delete(terminal.connectionUuid + terminal.direction);
			return currentCoordinates;
		});
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
	const flavorNovelConnectionUuids: Map<[flavorUuid: string, direction: Direction], string> =
		new Map();
	// track connectionIds that have already been used
	const usedInFlavorUuids: Set<string> = new Set();

	const connectedTerminals: Readable<Terminal[]> = derived(
		[focusedConnections, liveConnection],
		([currentFocusedConnections, currentLiveConnection]) => {
			// track connectionIds that have already been used
			usedInFlavorUuids.clear();

			const terminals: Terminal[] = currentFocusedConnections.flatMap((connection) => {
				// change in connection based terminals could mean the current novel uuid has been used
				if (flavorNovelConnectionUuids.has([connection.inFlavorUuid, Direction.In])) {
					flavorNovelConnectionUuids.delete([connection.inFlavorUuid, Direction.In]);
				}
				if (flavorNovelConnectionUuids.has([connection.outFlavorUuid, Direction.Out])) {
					flavorNovelConnectionUuids.delete([connection.outFlavorUuid, Direction.Out]);
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
							let inNovelConnectionUuid = flavorNovelConnectionUuids.get([
								flavor.uuid,
								Direction.In
							]);

							// make a new one if it doesnt exist
							if (!inNovelConnectionUuid) {
								inNovelConnectionUuid = uuid();
								flavorNovelConnectionUuids.set([flavor.uuid, Direction.In], inNovelConnectionUuid);
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
							let outNovelConnectionUuid = flavorNovelConnectionUuids.get([
								flavor.uuid,
								Direction.Out
							]);
							if (!outNovelConnectionUuid) {
								outNovelConnectionUuid = uuid();
								flavorNovelConnectionUuids.set(
									[flavor.uuid, Direction.Out],
									outNovelConnectionUuid
								);
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
