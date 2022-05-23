import type { Connection } from '@prisma/client';
export type { Connection } from '@prisma/client';

import type { FlavorType } from '$lib/flavors';
import { type Writable, writable } from 'svelte/store';

export interface ConnectionState {
	connectionId: number;
	flavorType: FlavorType;
	in: {
		ingredientId: number;
		flavorName: string;
	};
	out: {
		ingredientId: number;
		flavorName: string;
	};
}
export const connectionsStore: Writable<{
	[connectionId: number]: ConnectionState;
}> = writable({});

export function addConnection(connection: ConnectionState) {
	connectionsStore.update((connections) => {
		connections[connection.connectionId] = connection;
		return connections;
	});
}

export function updateConnection(connection: ConnectionState) {
	connectionsStore.update((connections) => {
		connections[connection.connectionId] = connection;
		return connections;
	});
}

export function removeConnection(connectionId: number): void {
	connectionsStore.update((connections) => {
		delete connections[connectionId];
		return connections;
	});
}
