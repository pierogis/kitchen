export interface Connection {
	uuid: string;
	parentIngredientUuid: string;
	inFlavorUuid: string;
	outFlavorUuid: string;
}

// import { type Writable, writable } from 'svelte/store';

// export const connections: Writable<Map<string, Connection>> = writable();

// export function addConnection(connection: Connection) {
// 	connections.update((currentConnections) => {
// 		currentConnections[connection.uuid] = connection;
// 		return currentConnections;
// 	});
// }

// export function updateConnection(connection: Connection) {
// 	connections.update((currentConnections) => {
// 		currentConnections[connection.uuid] = connection;
// 		return currentConnections;
// 	});
// }

// export function removeConnection(connectionUuid: string): void {
// 	connections.update((currentConnections) => {
// 		delete currentConnections[connectionUuid];
// 		return currentConnections;
// 	});
// }
