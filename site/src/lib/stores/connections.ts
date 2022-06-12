import { v4 as uuid } from 'uuid';

import type { FullRecipe } from '$lib/common/types';
import { writableMap, type WritableMap } from '$lib/common/stores';

import type { Connection } from '$lib/connections';

export const connections: WritableMap<string, Connection> = writableMap(new Map());

export function storeConnections(recipe: FullRecipe) {
	connections.set(
		new Map(
			recipe.callsFor.reduce<[string, Connection][]>((previous, callFor) => {
				previous = previous.concat(
					callFor.ingredient.connections.map((connection) => [connection.uuid, connection])
				);

				return previous;
			}, [])
		)
	);
}

export function addConnection(connection: Omit<Connection, 'uuid'>) {
	const newUuid = uuid();

	const newConnection = { ...connection, uuid: newUuid };

	return connections.add(newUuid, newConnection);
}

export function updateConnection(connection: Connection) {
	return connections.updateEntry(connection.uuid, connection);
}

export function removeConnection(uuid: string) {
	return connections.delete(uuid);
}
