import { Writable, writable } from "svelte/store";
import type { TerminalDirection } from "../terminals/terminals";

export interface ConnectionState {
  id: string;
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
    $connections[state.id] = state;
    return $connections;
  });
}

export function updateConnection(connection: ConnectionState) {
  connectionsStore.update(($connections) => {
    $connections[connection.id] = connection;
    return $connections;
  });
}
