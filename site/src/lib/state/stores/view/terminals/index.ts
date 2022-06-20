import { derived, type Readable } from 'svelte/store';
import { v4 as uuid } from 'uuid';

import { Direction, FlavorType, type Connection, type Flavor } from '@types';

import type { LiveConnectionState } from '@view';

export { createTerminalsCoordinates, type TerminalsCoordinatesState } from './coordinates';

export const terminalHeight = 10;

export type Terminal = {
	flavorUuid?: string;
	direction: Direction;
	connectionUuid: string;
	cabled: boolean;
	flavorType: FlavorType;
};

export function createTerminals(
	focusedConnections: Readable<Connection[]>,
	focusedFlavors: Readable<Flavor[]>,
	liveConnection: LiveConnectionState,
	dockedFlavors: Readable<Flavor[]>
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
		[focusedFlavors, dockedFlavors, connectedTerminals, liveConnection],
		([
			currentFocusedFlavors,
			currentDockedFlavors,
			currentConnectedTerminals,
			currentLiveConnection
		]) => {
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
			currentFocusedFlavors.concat(currentDockedFlavors).forEach((flavor) => {
				flavor.directions.forEach((direction) => {
					// don't create a novel terminal in place of the live connection's disconnected terminal
					if (
						currentLiveConnection?.disconnectedFlavorUuid != flavor.uuid ||
						currentLiveConnection?.dragDirection != direction
					) {
						// there should only be one in terminal on each flavor
						if (direction == Direction.In) {
							if (
								!currentConnectedTerminals.find(
									(terminal) =>
										terminal.flavorUuid == flavor.uuid && terminal.direction == Direction.In
								)
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
							}
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
