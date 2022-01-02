import { Writable, writable } from "svelte/store";

// context key for stashing all nodes updates callbacks

// the different types of data linking
export enum ConnectionInputType {
  number,
  color,
}

export interface ConnectionState {
  connectionId: string;
  inputType: ConnectionInputType;
  in: {
    nodeId: string;
    inputName: string;
  };
  out: {
    nodeId: string;
    inputName: string;
  };
}
export const connectionsStore: Writable<{ [key: string]: ConnectionState }> =
  writable({});

export function addConnection(state: ConnectionState) {
  connectionsStore.update(($connections) => {
    $connections[state.connectionId] = state;
    return $connections;
  });
}

export function updateConnection(state: ConnectionState) {
  connectionsStore.update(($connections) => {
    $connections[state.connectionId] = state;
    return $connections;
  });
}

export function removeConnection(connectionId: string): void {
  connectionsStore.update(($connections) => {
    delete $connections[connectionId];
    return $connections;
  });
}
