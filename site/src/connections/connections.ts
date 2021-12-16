import { Writable, writable } from "svelte/store";
import type { TerminalDirection } from "../terminals/terminals";

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
