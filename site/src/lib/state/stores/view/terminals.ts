import { derived, writable, type Readable, type Writable } from 'svelte/store';
import { v4 as uuid } from 'uuid';

import { Direction, FlavorType, type Ingredient } from '$lib/common/types';

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
	state: RecipeState,
	focusedIngredient: Readable<Ingredient>,
	liveConnection: LiveConnectionState
): Readable<Terminal[]> {
	const focusedConnections = derived(
		[focusedIngredient, state.connections],
		([currentFocusedIngredient, currentConnections]) =>
			Array.from(currentConnections.values()).filter(
				(connection) => connection.parentIngredientUuid == currentFocusedIngredient.uuid
			)
	);

	const flavorNovelConnectionUuids: Map<[flavorUuid: string, direction: Direction], string> =
		new Map();

	const terminals: Readable<Terminal[]> = derived(
		[focusedConnections, state.flavors, liveConnection],
		([currentFocusedConnections, currentFlavors, currentLiveConnection]) => {
			// track connectionIds that have already been used
			const usedDirectedConnectionIds: Set<[connectionUuid: string, direction: Direction]> =
				new Set();
			const usedInFlavorUuids: Set<string> = new Set();

			const terminals: Terminal[] = currentFocusedConnections.flatMap((connection) => {
				if (flavorNovelConnectionUuids.has([connection.inFlavorUuid, Direction.In])) {
					flavorNovelConnectionUuids.delete([connection.inFlavorUuid, Direction.In]);
				}
				if (flavorNovelConnectionUuids.has([connection.outFlavorUuid, Direction.Out])) {
					flavorNovelConnectionUuids.delete([connection.outFlavorUuid, Direction.Out]);
				}

				usedDirectedConnectionIds.add([connection.uuid, Direction.In]);
				usedDirectedConnectionIds.add([connection.uuid, Direction.Out]);
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
				usedDirectedConnectionIds.add([
					currentLiveConnection.connectionUuid,
					currentLiveConnection.anchorDirection
				]);

				terminals.push({
					flavorUuid: currentLiveConnection.anchorFlavorUuid,
					direction: currentLiveConnection.anchorDirection,
					connectionUuid: currentLiveConnection.connectionUuid,
					cabled: true,
					flavorType: currentLiveConnection.flavorType
				});
			}

			// maintain terminal for a disconnected flavor
			if (currentLiveConnection && currentLiveConnection.disconnectedFlavorUuid) {
				usedDirectedConnectionIds.add([
					currentLiveConnection.connectionUuid,
					currentLiveConnection.dragDirection
				]);

				terminals.push({
					flavorUuid: currentLiveConnection.disconnectedFlavorUuid,
					direction: currentLiveConnection.dragDirection,
					connectionUuid: uuid(),
					cabled: false,
					flavorType: currentLiveConnection.flavorType
				});
			}

			// creating novel terminals for each flavor
			currentFlavors.forEach((flavor) => {
				flavor.directions.forEach((direction) => {
					if (!usedInFlavorUuids.has(flavor.uuid) && direction == Direction.In) {
						let inNovelConnectionUuid = flavorNovelConnectionUuids.get([flavor.uuid, Direction.In]);

						if (!inNovelConnectionUuid) {
							inNovelConnectionUuid = uuid();
							flavorNovelConnectionUuids.set([flavor.uuid, Direction.In], inNovelConnectionUuid);
						}
						usedDirectedConnectionIds.add([inNovelConnectionUuid, Direction.In]);

						terminals.push({
							flavorUuid: flavor.uuid,
							direction: Direction.In,
							connectionUuid: inNovelConnectionUuid,
							cabled: false,
							flavorType: flavor.type
						});
					} else {
						let outNovelConnectionUuid = flavorNovelConnectionUuids.get([
							flavor.uuid,
							Direction.Out
						]);
						if (!outNovelConnectionUuid) {
							outNovelConnectionUuid = uuid();
							flavorNovelConnectionUuids.set([flavor.uuid, Direction.Out], outNovelConnectionUuid);
						}
						usedDirectedConnectionIds.add([outNovelConnectionUuid, Direction.Out]);

						terminals.push({
							flavorUuid: flavor.uuid,
							direction: Direction.Out,
							connectionUuid: outNovelConnectionUuid,
							cabled: false,
							flavorType: flavor.type
						});
					}
				});
			});

			return terminals;
		}
	);

	return terminals;
}
