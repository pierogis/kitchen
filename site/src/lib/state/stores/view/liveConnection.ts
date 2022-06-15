import { derived, get, writable, type Readable, type Writable } from 'svelte/store';

import { checkPointWithinBox } from '$lib/common/utils';
import { Direction, type FlavorType, type Ingredient, type Payload } from '$lib/common/types';
import { ActionType } from '$lib/state/actions';

import type { RecipeState } from '$lib/state/stores/recipe';
import type { Coordinates } from '.';
import type { Cable } from './cables';

export type LiveConnectionState = Readable<
	| {
			connectionUuid: string;
			anchorDirection: Direction;
			dragDirection: Direction;
			flavorType: FlavorType;
			anchorFlavorUuid: string;
			disconnectedFlavorUuid: string | undefined;
			payload: Payload<FlavorType> | undefined;
			connect: (targetFlavorUuid: string, existingConnectionUuid?: string) => void;
	  }
	| undefined
> & {
	// call this when releasing the live terminal, if this live cable is compatible
	anchor: (
		connectionUuid: string,
		anchorFlavorUuid: string,
		anchorDirection: Direction,
		dragDirection: Direction
	) => void;
	disconnect: (cable: Cable, grabbedDirection: Direction) => void;
};

export function createLiveConnection(
	recipeState: RecipeState,
	focusedIngredient: Readable<Ingredient>,
	cursorCoordinates: Readable<Coordinates | undefined>
): LiveConnectionState {
	// object describing the live cable for target terminals
	// including callback should a new connection happen in ui

	const store: Writable<
		| {
				connectionUuid: string;
				anchorDirection: Direction;
				dragDirection: Direction;
				flavorType: FlavorType;
				anchorFlavorUuid: string;
				disconnectedFlavorUuid: string | undefined;
				payload: Payload<FlavorType> | undefined;
				connect: (targetFlavorUuid: string, existingConnectionUuid?: string) => void;
		  }
		| undefined
	> = writable();

	const currentFocusedIngredientUuid = derived(
		focusedIngredient,
		(currentFocusedIngredient) => currentFocusedIngredient.uuid
	);

	const dragCoordinates: Readable<Coordinates | undefined> = derived(
		[cursorCoordinates],
		([currentCursorCoordinates]) => {
			return currentCursorCoordinates;
		}
	);

	function anchor(
		connectionUuid: string,
		anchorFlavorUuid: string,
		anchorDirection: Direction,
		dragDirection: Direction
	) {
		// find flavor that has gotten a novel grab
		const anchorFlavor = get(recipeState.flavors).get(anchorFlavorUuid);
		if (anchorFlavor) {
			// find parameters of flavor, if any
			const anchorPayload = Array.from(get(recipeState.parameters).values()).find(
				(parameter) => parameter.flavorUuid == anchorFlavor?.uuid
			);

			// set store with data on this new connection
			store.set({
				connectionUuid: connectionUuid,
				flavorType: anchorFlavor.type,
				anchorDirection,
				dragDirection,

				anchorFlavorUuid: anchorFlavorUuid,
				disconnectedFlavorUuid: undefined,

				payload: anchorPayload?.payload,
				connect
			});
		}
	}

	function disconnect(cable: Cable, grabbedDirection: Direction) {
		const anchorFlavorUuid =
			grabbedDirection == Direction.In ? cable.outFlavorUuid : cable.inFlavorUuid;
		if (anchorFlavorUuid) {
			store.set({
				connectionUuid: cable.connectionUuid,
				flavorType: cable.flavorType,
				anchorDirection: grabbedDirection == Direction.In ? Direction.Out : Direction.In,
				dragDirection: grabbedDirection,

				anchorFlavorUuid,
				disconnectedFlavorUuid: undefined,

				payload: undefined,
				connect
			});
		} else {
			throw `Cable ${cable.connectionUuid} does not have anchorFlavorUuid`;
		}
	}

	function connect(targetFlavorUuid: string, existingConnectionUuid?: string) {
		const liveConnection = get(store);
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
					connectionUuid: liveConnection.connectionUuid,
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

			store.set(undefined);
		}
	}

	return {
		subscribe: store.subscribe,
		anchor,
		disconnect
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
