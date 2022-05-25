import type { Connection } from '@prisma/client';
export type { Connection } from '@prisma/client';

import type { FlavorType } from '$lib/flavors';
import { type Writable, writable } from 'svelte/store';

export const connectionsStore: Writable<{
	[connectionId: number]: Connection;
}> = writable({});

export function addConnection(connection: Connection) {
	connectionsStore.update((connections) => {
		connections[connection.id] = connection;
		return connections;
	});
}

export function updateConnection(connection: Connection) {
	connectionsStore.update((connections) => {
		connections[connection.id] = connection;
		return connections;
	});
}

export function removeConnection(connectionId: number): void {
	connectionsStore.update((connections) => {
		delete connections[connectionId];
		return connections;
	});
}
