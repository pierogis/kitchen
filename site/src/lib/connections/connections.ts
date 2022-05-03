import type { FlavorType } from '$lib/flavors';
import { type Writable, writable } from 'svelte/store';

// context key for stashing all nodes updates callbacks

export interface ConnectionState {
	connectionId: string;
	flavorType: FlavorType;
	in: {
		ingredientId: string;
		flavorName: string;
	};
	out: {
		ingredientId: string;
		flavorName: string;
	};
}
export const connectionsStore: Writable<{
	[connectionId: string]: ConnectionState;
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

export function removeConnection(connectionId: string): void {
	connectionsStore.update((connections) => {
		delete connections[connectionId];
		return connections;
	});
}
