import { derived, get, writable, type Readable, type Writable } from 'svelte/store';
import { terminalHeight, type TerminalCenter } from '$lib/state/stores/view/terminals';
import { checkPointWithinBox } from '$lib/common/utils';
import { Direction, type FlavorType, type Connection } from '$lib/common/types';
import { ActionType } from '$lib/state/actions';
import type { ActionableState } from '../state';

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

function createLiveConnection(state: ActionableState) {
	// object describing the live cable for target terminals
	// including callback should a new connection happen in ui
	const liveConnection: Writable<LiveConnectionState> = writable(null);

	function anchorLiveConnection(
		connectionUuid: string,
		parentIngredientUuid: string,
		anchorFlavorUuid: string,
		anchorDirection: Direction,
		dragDirection: Direction,
		location: { x: number | undefined; y: number | undefined }
	) {
		let anchorFlavor = get(state.flavors).get(anchorFlavorUuid);

		if (anchorFlavor) {
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
						state.dispatch(ActionType.UpdateConnection, connectionState);
					} else {
						state.dispatch(ActionType.CreateConnection, connectionState);
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

						state.dispatch(ActionType.UpdateConnection, connectionState);
					} else {
						state.dispatch(ActionType.CreateConnection, connectionState);
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
	}

	return liveConnection;
}

export function createDropCable(
	liveConnection: Writable<LiveConnectionState>,
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
