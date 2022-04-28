import { Writable, writable } from 'svelte/store';

// context key for stashing all nodes updates callbacks

// the different types of data linking
export enum ParameterType {
	number,
	color,
	text,
	image
}

export interface ConnectionState {
	connectionId: string;
	parameterType: ParameterType;
	in: {
		nodeId: string;
		parameterName: string;
	};
	out: {
		nodeId: string;
		parameterName: string;
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
