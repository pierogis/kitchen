import { derived, get, writable, type Readable, type Writable } from 'svelte/store';

import { checkPointWithinBox } from '$lib/common/utils';
import { Direction, type FlavorType, type Connection, type Ingredient } from '$lib/common/types';
import { ActionType } from '$lib/state/actions';

import type { RecipeState } from '../recipe';
import type { Coordinates } from '../view';
import type { terminalHeight, Terminal } from '../view/terminals';
import type { Cable } from './cables';

export type LiveConnection = {
	// only react if this a compatible terminal
	anchored: Readable<boolean>;
	dragDirection: Readable<Direction | undefined>;
	flavorType: Readable<FlavorType | undefined>;
	anchorCoordinates: Readable<Coordinates | undefined>;
	dragCoordinates: Readable<Coordinates | undefined>;
	// call this when releasing the live terminal, if this live cable is compatible
	anchor: (
		connectionUuid: string,
		parentIngredientUuid: string,
		anchorFlavorUuid: string,
		anchorDirection: Direction,
		dragDirection: Direction
	) => void;
	disconnect: (cable: Cable, grabbedDirection: Direction) => void;
	connect: (targetFlavorUuid: string, existingConnectionUuid?: string) => void;
};

export function createLiveConnection(
	recipeState: RecipeState,
	focusedIngredient: Readable<Ingredient>,
	terminals: Readable<Terminal[]>,
	cursorCoordinates: Readable<Coordinates | undefined>
): LiveConnection {
	// object describing the live cable for target terminals
	// including callback should a new connection happen in ui

	const anchored = writable(false);

	const currentFocusedIngredientUuid = derived(
		focusedIngredient,
		(currentFocusedIngredient) => currentFocusedIngredient.uuid
	);

	const flavorType: Writable<FlavorType | undefined> = writable();
	const dragDirection: Writable<Direction | undefined> = writable();

	// coordinates
	const anchorCoordinates: Writable<Coordinates | undefined> = writable();

	anchored.subscribe((currentAnchored) => {
		if (currentAnchored && liveConnection) {
			// find the terminal that matches the anchorFlavor
			const connectionUuid = liveConnection.connectionUuid;
			const terminal = get(terminals).find((terminal) => terminal.connectionUuid == connectionUuid);

			return terminal?.coordinates.subscribe((currentCoordinates) => {
				anchorCoordinates.set(currentCoordinates);
			});
		}
	});

	const dragCoordinates: Readable<Coordinates | undefined> = derived(
		[anchored, cursorCoordinates],
		([currentAnchored, currentCursorCoordinates]) => {
			if (currentAnchored) {
				return currentCursorCoordinates;
			}
		}
	);

	// "namespace"
	let liveConnection:
		| {
				connectionUuid: string;
				parentIngredientUuid: string;
				anchorFlavorUuid: string;
				anchorDirection: Direction;
				dragDirection: Direction;
		  }
		| undefined;

	function anchor(
		connectionUuid: string,
		parentIngredientUuid: string,
		anchorFlavorUuid: string,
		anchorDirection: Direction
	) {
		let anchorFlavor = get(recipeState.flavors).get(anchorFlavorUuid);

		if (anchorFlavor) {
			liveConnection = {
				connectionUuid: connectionUuid,
				parentIngredientUuid: parentIngredientUuid,
				anchorFlavorUuid: anchorFlavorUuid,
				anchorDirection: anchorDirection,
				dragDirection: anchorDirection == Direction.In ? Direction.Out : Direction.In
			};
			anchored.set(true);
			flavorType.set(anchorFlavor.type);
			dragDirection.set(liveConnection.dragDirection);
		}
	}

	function disconnect(cable: Cable, grabbedDirection: Direction) {
		liveConnection = {
			connectionUuid: cable.connectionUuid,
			parentIngredientUuid: get(currentFocusedIngredientUuid),
			anchorFlavorUuid: grabbedDirection == Direction.In ? cable.outFlavorUuid : cable.inFlavorUuid,
			anchorDirection: grabbedDirection,
			dragDirection: grabbedDirection == Direction.In ? Direction.In : Direction.Out
		};
		anchored.set(true);
		flavorType.set(cable.flavorType);
		dragDirection.set(liveConnection.dragDirection);
	}

	function connect(targetFlavorUuid: string, existingConnectionUuid?: string) {
		if (liveConnection) {
			let actionType: ActionType;
			let connectionUuid = liveConnection.connectionUuid;

			if (existingConnectionUuid) {
				actionType = ActionType.UpdateConnection;
				connectionUuid = existingConnectionUuid;
			} else {
				actionType = ActionType.CreateConnection;
			}

			recipeState.dispatch({
				type: actionType,
				params: {
					connectionUuid,
					parentIngredientUuid: get(currentFocusedIngredientUuid),
					inFlavorUuid:
						liveConnection.anchorDirection == Direction.In
							? liveConnection.anchorFlavorUuid
							: targetFlavorUuid,
					outFlavorUuid:
						liveConnection.anchorDirection == Direction.In
							? targetFlavorUuid
							: liveConnection.anchorFlavorUuid
				}
			});

			anchored.set(false);
			flavorType.set(undefined);
			dragDirection.set(undefined);
		}
	}

	return {
		anchor,
		disconnect,
		connect,
		anchored: { subscribe: anchored.subscribe },
		dragDirection,
		flavorType,
		anchorCoordinates,
		dragCoordinates
	};
}

// export function createDropCable(
// 	liveConnection: Writable<LiveConnection>,
// 	terminalCenters: Readable<TerminalCenter[]>
// ) {
// 	const dropCableStore = derived(
// 		[liveConnection, terminalCenters],
// 		([currentLiveConnection, currentTerminalCenters]) => {
// 			// this subscription fires before the element is deleted
// 			return (coords: { x: number; y: number }) => {
// 				if (currentLiveConnection) {
// 					const targetTerminals = currentTerminalCenters.filter(
// 						(ingredientTerminalCenter) =>
// 							currentLiveConnection.flavorType == ingredientTerminalCenter.flavorType &&
// 							currentLiveConnection.dragDirection == ingredientTerminalCenter.direction &&
// 							!(currentLiveConnection.anchorFlavorUuid == ingredientTerminalCenter.flavorUuid)
// 					);

// 					const nearTerminalDistance = 4;
// 					// expanding the rect
// 					const targetTerminal = targetTerminals.find((terminalCenter) => {
// 						const terminalCoords = get(terminalCenter.coords);

// 						if (terminalCoords.x && terminalCoords.y) {
// 							const left = terminalCoords.x - (terminalHeight / 2 + nearTerminalDistance);
// 							const top = terminalCoords.y - (terminalHeight / 2 + nearTerminalDistance);
// 							const right = terminalCoords.x + (terminalHeight / 2 + nearTerminalDistance);
// 							const bottom = terminalCoords.y + (terminalHeight / 2 + nearTerminalDistance);

// 							return checkPointWithinBox(
// 								{ x: coords.x, y: coords.y },
// 								{ top: top, bottom: bottom, left: left, right: right }
// 							);
// 						}
// 					});

// 					// use the callback from the liveConnection store
// 					if (targetTerminal) {
// 						currentLiveConnection.attach(targetTerminal.flavorUuid, targetTerminal.connectionUuid);
// 					} else {
// 						liveConnection.set(null);
// 					}
// 				}
// 			};
// 		}
// 	);
// }
