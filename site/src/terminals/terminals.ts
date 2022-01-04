import { get, derived, writable, Writable } from "svelte/store";

import { connectionsStore, removeConnection } from "../connections/connections";
import { createLiveConnection } from "../connections/live-connection";

export enum TerminalDirection {
  in = "in",
  out = "out",
}
export type NodeTerminalCentersState = {
  nodeId: string;
  direction: TerminalDirection;
  inputName: string;
  connectionId: string;
  coords: Writable<{ x: number; y: number }>;
};

export const allNodesTerminalCentersStore = derived(
  [connectionsStore],
  ([connections]) => {
    let nodesCenters: NodeTerminalCentersState[] = [];

    Object.entries(connections).forEach(([connectionId, connection]) => {
      // the context is keyed by nodeId as a string
      // using an object key requires matching the reference
      // maybe pass down through props
      let inNodeId = connection.in.nodeId;
      // do the same for out
      let outNodeId = connection.out.nodeId;

      // add to the callbacks set for the given connection's "in" input name
      // this corresponds to the in (left) terminal on inputs

      // using a store to ultimately notify terminals of a new callback to use when
      // they providing updates on their bounding rect
      // use the out callback
      nodesCenters.push({
        nodeId: inNodeId,
        direction: TerminalDirection.in,
        inputName: connection.in.inputName,
        connectionId: connectionId,
        coords: writable({ x: undefined, y: undefined }),
      });
      nodesCenters.push({
        nodeId: outNodeId,
        direction: TerminalDirection.out,
        inputName: connection.out.inputName,
        connectionId: connectionId,
        coords: writable({ x: undefined, y: undefined }),
      });
    });

    return nodesCenters;
  }
);

// create a live connection by disconnecting an existing one
export function disconnectLiveConnection(
  connectionId: string,
  direction: TerminalDirection,
  location: { x: number; y: number }
) {
  const connection = get(connectionsStore)[connectionId];

  // anchorDirection is the opposite of the direction that engaged
  // this callback
  const anchorDirection =
    direction == TerminalDirection.in
      ? TerminalDirection.out
      : TerminalDirection.in;

  const inputType = connection.inputType;

  const { nodeId: anchorNodeId, inputName: anchorInputName } =
    connection[anchorDirection];
  removeConnection(connectionId);

  createLiveConnection(
    connectionId,
    anchorNodeId,
    anchorInputName,
    anchorDirection,
    direction,
    inputType,
    location
  );
}
