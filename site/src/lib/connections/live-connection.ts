import { derived, get, writable, type Writable } from 'svelte/store';
import { terminalCenters, terminalHeight } from '$lib/terminals';
import { checkPointWithinBox } from '$lib/common/utils';
import { Direction } from '$lib/common/types';
import { addConnection, connections, updateConnection } from '$lib/connections';
import type { Flavor, FlavorType } from '$lib/flavors';
import type { Connection } from '.';

export type LiveConnectionState = {
	// only react if this a compatible terminal
	connectionUuid: number;
	parentingredientUuid: number;
	flavorType: FlavorType;
	anchorFlavorUuid: number;
	anchorDirection: Direction;
	dragDirection: Direction;
	anchorCoordsStore: Writable<{ x: number | undefined; y: number | undefined }>;
	dragCoordsStore: Writable<{ x: number | undefined; y: number | undefined }>;
	// call this when releasing the live terminal, if this live cable is compatible
	attach: (targetFlavorUuid: number, existingConnectionUuid?: string) => void;
} | null;

// object describing the live cable for target terminals
// including callback should a new connection happen in ui
export const liveConnection: Writable<LiveConnectionState> = writable(null);

export function anchorLiveConnection(
	connectionUuid: string,
	parentingredientUuid: number,
	anchorFlavorUuid: number,
	anchorDirection: Direction,
	dragDirection: Direction,
	location: { x: number | undefined; y: number | undefined }
) {
	let anchorFlavor: Flavor = flavors[anchorFlavorUuid];

	let attach: (targetFlavorUuid: number, existingConnectionUuid?: number) => void;
	// when a terminal gets a mouseup, add a new connection depending on the in/out
	if (anchorDirection == Direction.In) {
		attach = (targetFlavorUuid: number, existingConnectionUuid?: number) => {
			// if this terminal is already connected, just update the connection's state to the new
			// node uuid, parameter name,
			const connectionState: Connection = {
				uuid: connectionUuid,
				parentingredientUuid,
				inFlavorUuid: anchorFlavorUuid,
				outFlavorUuid: targetFlavorUuid
			};

			if (existingConnectionUuid) {
				connectionState.uuid = existingConnectionUuid;
				updateConnection(connectionState);
			} else {
				addConnection(connectionState);
			}

			// need to delete live connection here
			liveConnection.set(null);
		};
	} else {
		attach = (targetFlavorUuid: number, existingConnectionUuid?: number) => {
			const connectionState: Connection = {
				uuid: connectionUuid,
				parentingredientUuid,
				inFlavorUuid: targetFlavorUuid,
				outFlavorUuid: anchorFlavorUuid
			};

			if (existingConnectionUuid) {
				connectionState.uuid = existingConnectionUuid;

				updateConnection(connectionState);
			} else {
				addConnection(connectionState);
			}

			liveConnection.set(null);
		};
	}

	liveConnection.set({
		connectionUuid,
		parentingredientUuid,
		anchorFlavorUuid,
		flavorType: anchorFlavor.type,
		anchorDirection,
		dragDirection,
		dragCoordsStore: writable(location),
		anchorCoordsStore: writable({ x: undefined, y: undefined }),
		attach: attach
	});
}

export const dropCableStore = derived(
	[liveConnection, terminalCenters],
	([currentLiveConnection, currentTerminalCenters]) => {
		// this subscription fires before the element is deleted
		return (coords: { x: number; y: number }) => {
			if (currentLiveConnection) {
				const targetTerminals = currentTerminalCenters.filter(
					(ingredientTerminalCenter) =>
						currentLiveConnection.flavorType == ingredientTerminalCenter.flavorType &&
						currentLiveConnection.dragDirection == ingredientTerminalCenter.direction &&
						!(currentLiveConnection.anchorFlavorUuid == ingredientTerminalCenter.flavorUuid)
				);

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
					currentLiveConnection.attach(targetTerminal.flavorUuid, targetTerminal.connectionUuid);
				} else {
					liveConnection.set(null);
				}
			}
		};
	}
);
