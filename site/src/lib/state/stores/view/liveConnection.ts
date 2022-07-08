import { derived, get, writable, type Readable, type Writable } from 'svelte/store';

import { Direction, type Flavor, type FlavorType, type Ingredient, type Usage } from '@types';

import { ActionType, type ActionParams } from '@state/actions';
import type { RecipeState } from '@recipe';
import type { Terminal } from '.';

export type LiveConnection = {
	connectionUuid: string;
	anchorDirection: Direction;
	dragDirection: Direction;
	flavorType: FlavorType;
	anchorFlavorUuid: string;
	anchorUsageUuid?: string;
	disconnectedFlavorUuid: string | undefined;
	disconnectedUsageUuid?: string | undefined;
	connect: (
		targetFlavorUuid: string,
		targetUsageUuid?: string,
		existingConnectionUuid?: string
	) => void;
	drop: () => void;
};

export type LiveConnectionState = Readable<LiveConnection | undefined> & {
	// call this when releasing the live terminal, if this live cable is compatible
	anchor: (terminal: Terminal) => void;
	disconnect: (terminal: Terminal) => void;
};

export function createLiveConnection(
	recipeState: RecipeState,
	focusedIngredient: Readable<Ingredient>,
	dockedFlavors: Readable<Flavor[]>
): LiveConnectionState {
	// object describing the live cable for target terminals
	// including callback should a new connection happen in ui

	const store: Writable<LiveConnection | undefined> = writable();

	function anchor(terminal: Terminal) {
		const liveConnection = get(store);

		if (liveConnection) {
			throw 'There is already a live connection';
		}

		const dragDirection = terminal.direction == Direction.In ? Direction.Out : Direction.In;
		if (terminal.flavorUuid) {
			// set store with data on this new connection
			store.set({
				connectionUuid: terminal.connectionUuid,
				flavorType: terminal.flavorType,
				anchorDirection: terminal.direction,
				dragDirection,

				anchorFlavorUuid: terminal.flavorUuid,
				anchorUsageUuid: terminal.usageUuid,
				disconnectedFlavorUuid: undefined,
				disconnectedUsageUuid: undefined,

				drop,
				connect
			});
		}
	}

	function disconnect(terminal: Terminal) {
		const liveConnection = get(store);

		if (liveConnection) {
			throw 'there is already a live connection';
		}
		if (terminal.flavorUuid && terminal.usageUuid) {
			const anchorDirection = terminal.direction == Direction.In ? Direction.Out : Direction.In;

			const connection = get(recipeState.connections).get(terminal.connectionUuid);

			if (connection) {
				// dispatch a delete action
				recipeState.dispatch({
					type: ActionType.DeleteConnections,
					params: {
						connections: [connection]
					}
				});

				const anchorFlavorUuid =
					anchorDirection == Direction.In ? connection?.inFlavorUuid : connection?.outFlavorUuid;

				store.set({
					connectionUuid: terminal.connectionUuid,
					flavorType: terminal.flavorType,

					dragDirection: terminal.direction,
					anchorDirection: terminal.direction == Direction.In ? Direction.Out : Direction.In,

					anchorFlavorUuid,
					disconnectedFlavorUuid: terminal.flavorUuid,
					anchorUsageUuid: terminal.usageUuid,
					disconnectedUsageUuid: terminal.usageUuid,

					drop,
					connect
				});
			} else {
				throw `connection ${terminal.connectionUuid} not found`;
			}
		} else {
			throw `grabbed terminal for connection ${terminal.connectionUuid} (${terminal.direction}) does not have flavorUuid`;
		}
	}

	function connect(
		targetFlavorUuid: string,
		targetUsageUuid?: string,
		existingConnectionUuid?: string
	) {
		const liveConnection = get(store);
		if (liveConnection) {
			if (
				targetFlavorUuid != liveConnection.anchorFlavorUuid ||
				get(dockedFlavors).some((flavor) => flavor.uuid == targetFlavorUuid)
			) {
				let actionType: ActionType;
				let connectionUuid = liveConnection.connectionUuid;

				if (existingConnectionUuid) {
					actionType = ActionType.UpdateConnections;
					connectionUuid = existingConnectionUuid;
				} else {
					actionType = ActionType.CreateConnections;
				}

				const parentIngredientUuid = get(focusedIngredient).uuid;

				const params: ActionParams<ActionType.CreateConnections> = {
					connections: [
						{
							uuid: connectionUuid,
							parentIngredientUuid: parentIngredientUuid,
							flavorType: liveConnection.flavorType,
							inFlavorUuid:
								liveConnection.anchorDirection == Direction.In
									? liveConnection.anchorFlavorUuid
									: targetFlavorUuid,
							outFlavorUuid:
								liveConnection.anchorDirection == Direction.In
									? targetFlavorUuid
									: liveConnection.anchorFlavorUuid,
							inUsageUuid:
								liveConnection.anchorDirection == Direction.In
									? liveConnection.anchorUsageUuid
									: targetFlavorUuid,
							outUsageUuid:
								liveConnection.anchorDirection == Direction.In
									? targetFlavorUuid
									: liveConnection.anchorUsageUuid
						}
					]
				};

				recipeState.dispatch({
					type: actionType,
					params
				});
			}

			store.set(undefined);
		} else {
			throw 'there is no live connection';
		}
	}

	function drop() {
		const liveConnection = get(store);

		if (liveConnection) {
			store.set(undefined);
		} else {
			throw 'there is no live connection';
		}
	}

	return {
		subscribe: store.subscribe,
		anchor,
		disconnect
	};
}
