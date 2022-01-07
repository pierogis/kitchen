import { derived, writable, Writable } from "svelte/store";

import {
  ConnectionInputType,
  connectionsStore,
} from "../connections/connections";
import { nodesStore } from "../nodes/nodes";

export const terminalHeight = 10;

export enum TerminalDirection {
  in = "in",
  out = "out",
}
export type NodeTerminalCentersState = {
  nodeId: string;
  direction: TerminalDirection;
  inputName: string;
  connectionId: string | null;
  inputType: ConnectionInputType;
  coords: Writable<{ x: number; y: number }>;
};

export const allNodesTerminalCentersStore = derived(
  [nodesStore, connectionsStore],
  ([nodes, connections]) => {
    let connectionCenters: NodeTerminalCentersState[] = [];

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
      connectionCenters.push({
        nodeId: inNodeId,
        direction: TerminalDirection.in,
        inputName: connection.in.inputName,
        connectionId: connectionId,
        inputType: connection.inputType,
        coords: writable({ x: undefined, y: undefined }),
      });
      connectionCenters.push({
        nodeId: outNodeId,
        direction: TerminalDirection.out,
        inputName: connection.out.inputName,
        connectionId: connectionId,
        inputType: connection.inputType,
        coords: writable({ x: undefined, y: undefined }),
      });
    });

    let novelCenters: NodeTerminalCentersState[] = [];
    Object.entries(nodes).forEach(([nodeId, node]) => {
      Object.entries(node.racks.in).forEach(([inputName, inRack]) => {
        if (
          !connectionCenters.find((center) => {
            return (
              center.direction == TerminalDirection.in &&
              center.nodeId == nodeId
            );
          })
        ) {
          const novelCenter = {
            nodeId: nodeId,
            direction: TerminalDirection.in,
            inputName: inputName,
            connectionId: null,
            inputType: inRack.inputType,
            coords: writable({ x: undefined, y: undefined }),
          };
          novelCenters.push(novelCenter);
        }
      });
      Object.entries(node.racks.out).forEach(([inputName, outRack]) => {
        const novelCenter = {
          nodeId: nodeId,
          direction: TerminalDirection.out,
          inputName: inputName,
          connectionId: null,
          inputType: outRack.inputType,
          coords: writable({ x: undefined, y: undefined }),
        };
        novelCenters.push(novelCenter);
      });
    });

    return connectionCenters.concat(novelCenters);
  }
);
