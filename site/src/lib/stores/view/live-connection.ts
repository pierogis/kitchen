import { derived, get, writable, type Readable, type Writable } from 'svelte/store';
import { terminalHeight, type TerminalCenter } from '$lib/stores/view/terminals';
import { checkPointWithinBox } from '$lib/common/utils';
import { Direction, type Flavor, type FlavorType, type Connection } from '$lib/common/types';

export type LiveConnectionState = {
	// only react if this a compatible terminal
	connectionUuid: string;
	parentIngredientUuid: string;
	flavorType: FlavorType;
	anchorFlavorUuid: string;
	anchorDirection: Direction;
	dragDirection: Direction;
	anchorCoordsStore: Writable<{ x: number | undefined; y: number | undefined }>;
	dragCoordsStore: Writable<{ x: number | undefined; y: number | undefined }>;
	// call this when releasing the live terminal, if this live cable is compatible
	attach: (targetFlavorUuid: string, existingConnectionUuid?: string) => void;
} | null;

// object describing the live cable for target terminals
// including callback should a new connection happen in ui
export const liveConnection: Writable<LiveConnectionState> = writable(null);

export function anchorLiveConnection(
	connectionUuid: string,
	parentIngredientUuid: string,
	anchorFlavorUuid: string,
	anchorDirection: Direction,
	dragDirection: Direction,
	location: { x: number | undefined; y: number | undefined }
) {
	let anchorFlavor: Flavor = flavors[anchorFlavorUuid];

	let attach: (targetFlavorUuid: string, existingConnectionUuid?: string) => void;
	// when a terminal gets a mouseup, add a new connection depending on the in/out
	if (anchorDirection == Direction.In) {
		attach = (targetFlavorUuid: string, existingConnectionUuid?: string) => {
			// if this terminal is already connected, just update the connection's state to the new
			// node uuid, parameter name,
			const connectionState: Connection = {
				uuid: connectionUuid,
				parentIngredientUuid,
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
		attach = (targetFlavorUuid: string, existingConnectionUuid?: string) => {
			const connectionState: Connection = {
				uuid: connectionUuid,
				parentIngredientUuid,
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
		parentIngredientUuid,
		anchorFlavorUuid,
		flavorType: anchorFlavor.type,
		anchorDirection,
		dragDirection,
		dragCoordsStore: writable(location),
		anchorCoordsStore: writable({ x: undefined, y: undefined }),
		attach: attach
	});
}

export function readableDropCable(
	liveConnection: Readable<LiveConnectionState>,
	terminalCenters: Readable<TerminalCenter[]>
) {
	const dropCableStore = derived(
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

						if (terminalCoords.x && terminalCoords.y) {
							const left = terminalCoords.x - (terminalHeight / 2 + nearTerminalDistance);
							const top = terminalCoords.y - (terminalHeight / 2 + nearTerminalDistance);
							const right = terminalCoords.x + (terminalHeight / 2 + nearTerminalDistance);
							const bottom = terminalCoords.y + (terminalHeight / 2 + nearTerminalDistance);

							return checkPointWithinBox(
								{ x: coords.x, y: coords.y },
								{ top: top, bottom: bottom, left: left, right: right }
							);
						}
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
}
