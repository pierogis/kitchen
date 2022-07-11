import { derived, type Readable } from 'svelte/store';
import { v4 as uuid } from 'uuid';

import { Direction, FlavorType, type Connection, type FlavorUsage } from '@types';

import type { LiveConnectionState, Node } from '@view';

export { createTerminalsCoordinates, type TerminalsCoordinatesState } from './coordinates';

export const terminalHeight = 10;

export type Terminal = {
	flavorUuid?: string;
	direction: Direction;
	connectionUuid: string;
	usageUuid?: string;
	cabled: boolean;
	flavorType: FlavorType;
};

export function createTerminals(
	inFocusConnections: Readable<Connection[]>,
	nodes: Readable<Node[]>,
	liveConnection: LiveConnectionState,
	dockedFlavors: Readable<FlavorUsage[]>
): Readable<Terminal[]> {
	const flavorNovelConnectionUuids: Map<string, string> = new Map();
	// track connectionIds that have already been used
	const usedInFlavorUuids: Set<string> = new Set();

	const connectedTerminals: Readable<Terminal[]> = derived(
		[inFocusConnections, liveConnection],
		([$inFocusConnections, $liveConnection]) => {
			// track connectionIds that have already been used
			usedInFlavorUuids.clear();

			const terminals: Terminal[] = $inFocusConnections.flatMap((connection) => {
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
						flavorType: connection.flavorType,
						usageUuid: connection.inUsageUuid
					},
					{
						flavorUuid: connection.outFlavorUuid,
						direction: Direction.Out,
						connectionUuid: connection.uuid,
						cabled: true,
						flavorType: connection.flavorType,
						usageUuid: connection.outUsageUuid
					}
				];
			});

			// maintain terminal for live anchored flavor
			if ($liveConnection) {
				if (
					flavorNovelConnectionUuids.has(
						$liveConnection.anchorFlavorUuid + $liveConnection.anchorDirection
					)
				) {
					flavorNovelConnectionUuids.delete(
						$liveConnection.anchorFlavorUuid + $liveConnection.anchorDirection
					);
				}
				usedInFlavorUuids.add($liveConnection.anchorFlavorUuid);

				terminals.push({
					flavorUuid: $liveConnection.anchorFlavorUuid,
					direction: $liveConnection.anchorDirection,
					connectionUuid: $liveConnection.connectionUuid,
					cabled: true,
					flavorType: $liveConnection.flavorType,
					usageUuid: $liveConnection.anchorUsageUuid
				});
			}

			return terminals;
		}
	);

	const novelTerminals: Readable<Terminal[]> = derived(
		[nodes, dockedFlavors, connectedTerminals, liveConnection],
		([$nodes, $dockedFlavors, $connectedTerminals, $liveConnection]) => {
			const novelTerminals: Terminal[] = [];
			// maintain terminal for a disconnected flavor
			if ($liveConnection && $liveConnection.disconnectedFlavorUuid) {
				novelTerminals.push({
					flavorUuid: $liveConnection.disconnectedFlavorUuid,
					direction: $liveConnection.dragDirection,
					connectionUuid: uuid(),
					cabled: false,
					flavorType: $liveConnection.flavorType,
					usageUuid: $liveConnection.disconnectedUsageUuid
				});
			}

			const allFlavorUsages = [
				...$nodes.flatMap((node) =>
					node.flavors.map((flavor) => {
						return { ...flavor, usageUuid: node.callFor.usageUuid };
					})
				),
				...$dockedFlavors
			];

			// creating novel terminals for each flavor
			allFlavorUsages.forEach((flavorUsage) => {
				flavorUsage.directions.forEach((direction) => {
					// don't create a novel terminal in place of the live connection's disconnected terminal
					if (
						$liveConnection?.disconnectedFlavorUuid != flavorUsage.uuid ||
						$liveConnection?.dragDirection != direction
					) {
						// there should only be one in terminal on each flavor
						if (direction == Direction.In) {
							if (
								!$connectedTerminals.find(
									(terminal) =>
										terminal.flavorUuid == flavorUsage.uuid && terminal.direction == Direction.In
								)
							) {
								// preserve the flavor's novel connection uuids
								let inNovelConnectionUuid = flavorNovelConnectionUuids.get(
									flavorUsage.uuid + Direction.In
								);

								// make a new one if it doesnt exist
								if (!inNovelConnectionUuid) {
									inNovelConnectionUuid = uuid();
									flavorNovelConnectionUuids.set(
										flavorUsage.uuid + Direction.In,
										inNovelConnectionUuid
									);
								}

								novelTerminals.push({
									flavorUuid: flavorUsage.uuid,
									direction: Direction.In,
									connectionUuid: inNovelConnectionUuid,
									cabled: false,
									flavorType: flavorUsage.type,
									usageUuid: flavorUsage.usageUuid
								});
							}
						} else {
							// don't create a terminal pointing out of the focused ingredient
							if (!flavorUsage.prepUuid || flavorUsage.usageUuid) {
								// do the same for out terminal
								let outNovelConnectionUuid = flavorNovelConnectionUuids.get(
									flavorUsage.uuid + Direction.Out
								);
								if (!outNovelConnectionUuid) {
									outNovelConnectionUuid = uuid();
									flavorNovelConnectionUuids.set(
										flavorUsage.uuid + Direction.Out,
										outNovelConnectionUuid
									);
								}

								novelTerminals.push({
									flavorUuid: flavorUsage.uuid,
									direction: Direction.Out,
									connectionUuid: outNovelConnectionUuid,
									cabled: false,
									flavorType: flavorUsage.type,
									usageUuid: flavorUsage.usageUuid
								});
							}
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
