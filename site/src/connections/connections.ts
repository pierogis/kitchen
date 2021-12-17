import { Writable, writable } from "svelte/store";

export interface ConnectionState {
  connectionId: string;
  in: {
    nodeId: string;
    inputName: string;
  };
  out: {
    nodeId: string;
    inputName: string;
  };
}
export let connectionsStore: Writable<{ [key: string]: ConnectionState }> =
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

export function removeConnection(state: ConnectionState) {
  connectionsStore.update(($connections) => {
    delete $connections[state.connectionId];
    return $connections;
  });
}
