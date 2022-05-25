import { derived, get, writable, type Writable } from 'svelte/store';
import { allNodesTerminalCentersStore, terminalHeight } from '$lib/terminals';
import { checkPointWithinBox } from '$lib/common/utils';
import { Direction } from '$lib/common/types';
import { addConnection, updateConnection } from '$lib/connections';
import type { FlavorType } from '@prisma/client';
import type { Connection } from '.';

export type LiveConnectionState = {
	// only react if this a compatible terminal
	connectionId: number;
	flavorType: FlavorType;
	anchorNodeId: number;
	anchorParameterName: string;
	anchorDirection: Direction;
	dragDirection: Direction;
	anchorCoordsStore: Writable<{ x: number; y: number }>;
	dragCoordsStore: Writable<{ x: number; y: number }>;
	// call this when releasing the live terminal, if this live cable is compatible
	attach: (
		targetNodeId: number,
		targetParameterName: string,
		existingConnectionId?: number
	) => void;
} | null;

// object describing the live cable for target terminals
// including callback should a new connection happen in ui
export const liveConnectionStore: Writable<LiveConnectionState> = writable(null);

export function anchorLiveConnection(
	connectionId: number,
	anchorNodeId: number,
	anchorParameterName: string,
	anchorDirection: Direction,
	dragDirection: Direction,
	flavorType: FlavorType,
	location: { x: number; y: number }
) {
	let attach: (
		targetNodeId: number,
		targetParameterName: string,
		existingConnectionId?: number
	) => void;
	// when a terminal gets a mouseup, add a new connection depending on the in/out
	if (anchorDirection == Direction.In) {
		attach = (targetNodeId: number, targetParameterName: string, existingConnectionId?: number) => {
			// if this terminal is already connected, just update the connection's state to the new
			// node id, parameter name,
			const connectionState: Connection = {
				connectionId: connectionId,
				flavorType: flavorType,
				In: {
					ingredientId: anchorNodeId,
					flavorName: anchorParameterName
				},
				Out: {
					ingredientId: targetNodeId,
					flavorName: targetParameterName
				}
			};

			if (existingConnectionId) {
				connectionState.connectionId = existingConnectionId;
				updateConnection(connectionState);
			} else {
				addConnection(connectionState);
			}

			// need to delete live connection here
			liveConnectionStore.set(null);
		};
	} else {
		attach = (targetNodeId: number, targetParameterName: string, existingConnectionId?: number) => {
			const connectionState: Connection = {
				connectionId: connectionId,
				flavorType: flavorType,
				In: {
					ingredientId: targetNodeId,
					flavorName: targetParameterName
				},
				Out: {
					ingredientId: anchorNodeId,
					flavorName: anchorParameterName
				}
			};

			if (existingConnectionId) {
				connectionState.connectionId = existingConnectionId;

				updateConnection(connectionState);
			} else {
				addConnection(connectionState);
			}

			liveConnectionStore.set(null);
		};
	}

	liveConnectionStore.set({
		connectionId: connectionId,
		anchorNodeId: anchorNodeId,
		anchorParameterName: anchorParameterName,
		flavorType: flavorType,
		anchorDirection: anchorDirection,
		dragDirection: dragDirection,
		dragCoordsStore: writable(location),
		anchorCoordsStore: writable({ x: undefined, y: undefined }),
		attach: attach
	});
}

export const dropCableStore = derived(
	[liveConnectionStore, allNodesTerminalCentersStore],
	([liveConnection, allNodesTerminalCenters]) => {
		// this subscription fires before the element is deleted
		return (coords: { x: number; y: number }) => {
			if (liveConnection) {
				const targetTerminals = allNodesTerminalCenters.filter((nodeTerminalCenter) => {
					return (
						liveConnection.flavorType == nodeTerminalCenter.flavorType &&
						liveConnection.dragDirection == nodeTerminalCenter.direction &&
						!(
							liveConnection.anchorNodeId == nodeTerminalCenter.ingredientId &&
							liveConnection.anchorParameterName == nodeTerminalCenter.flavorName
						)
					);
				});

				const nearTerminalDistance = 4;
				// expanding the rect
				const targetTerminal = targetTerminals.find((terminalCenter) => {
					const terminalCoords = get(terminalCenter.coords);

					const left = terminalCoords.x - (terminalHeight / 2 + nearTerminalDistance);
					const top = terminalCoords.y - (terminalHeight / 2 + nearTerminalDistance);
					const right = terminalCoords.x + (terminalHeight / 2 + nearTerminalDistance);
					const bottom = terminalCoords.y + (terminalHeight / 2 + nearTerminalDistance);

					return checkPointWithinBox(
						{ x: coords.x, y: coords.y },
						{ top: top, bottom: bottom, left: left, right: right }
					);
				});

				// use the callback from the liveConnection store
				if (targetTerminal) {
					liveConnection.attach(
						targetTerminal.ingredientId,
						targetTerminal.flavorName,
						targetTerminal.connectionId
					);
				} else {
					liveConnectionStore.set(null);
				}
			}
		};
	}
);
