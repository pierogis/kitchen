import { v4 as uuid } from 'uuid';

import type { FullRecipe, Connection } from '$lib/common/types';
import { writableMap, type WritableMap } from '$lib/common/stores';
import { type Readable, derived } from 'svelte/store';
import { state } from '.';

// export const connections: WritableMap<string, Connection> = writableMap(new Map());

export function storeConnections(recipe: FullRecipe): Map<string, Connection> {
	return new Map(
		recipe.callsFor.reduce<[string, Connection][]>((previous, callFor) => {
			previous = previous.concat(
				callFor.ingredient.connections.map((connection) => [connection.uuid, connection])
			);

			return previous;
		}, [])
	);
}

// export function addConnection(connection: Omit<Connection, 'uuid'>) {
// 	const newUuid = uuid();

// 	const newConnection = { ...connection, uuid: newUuid };

// 	return connections.add(newUuid, newConnection);
// }

// export function updateConnection(connection: Connection) {
// 	return connections.updateEntry(connection.uuid, connection);
// }

// export function removeConnection(uuid: string) {
// 	return connections.delete(uuid);
// }

export const connections: Readable<Map<string, Connection>> = derived(state, (currentState) => {
	return currentState.connections;
});
