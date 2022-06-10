import type { Connection } from '@prisma/client';
export type { Connection } from '@prisma/client';

import { type Writable, writable } from 'svelte/store';

export const connections: Writable<{
	[connectionId: number]: Connection;
}> = writable({});

export function addConnection(connection: Connection) {
	connections.update((currentConnections) => {
		currentConnections[connection.id] = connection;
		return currentConnections;
	});
}

export function updateConnection(connection: Connection) {
	connections.update((currentConnections) => {
		currentConnections[connection.id] = connection;
		return currentConnections;
	});
}

export function removeConnection(connectionId: number): void {
	connections.update((currentConnections) => {
		delete currentConnections[connectionId];
		return currentConnections;
	});
}
