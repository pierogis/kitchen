import { derived, writable, Writable } from "svelte/store";

import { ParameterType, connectionsStore } from "../connections/connections";
import { nodesStore } from "../nodes/nodes";

export const terminalHeight = 10;

export enum TerminalDirection {
  in = "in",
  out = "out",
}
export type NodeTerminalCentersState = {
  nodeId: string;
  direction: TerminalDirection;
  parameterName: string;
  connectionId: string | null;
  parameterType: ParameterType;
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

      // add to the callbacks set for the given connection's "in" parameter name
      // this corresponds to the in (left) terminal on parameters

      // using a store to ultimately notify terminals of a new callback to use when
      // they providing updates on their bounding rect
      // use the out callback
      connectionCenters.push({
        nodeId: inNodeId,
        direction: TerminalDirection.in,
        parameterName: connection.in.parameterName,
        connectionId: connectionId,
        parameterType: connection.parameterType,
        coords: writable({ x: undefined, y: undefined }),
      });
      connectionCenters.push({
        nodeId: outNodeId,
        direction: TerminalDirection.out,
        parameterName: connection.out.parameterName,
        connectionId: connectionId,
        parameterType: connection.parameterType,
        coords: writable({ x: undefined, y: undefined }),
      });
    });

    let novelCenters: NodeTerminalCentersState[] = [];
    Object.entries(nodes).forEach(([nodeId, node]) => {
      Object.entries(node.racks.in).forEach(([parameterName, inRack]) => {
        if (
          !connectionCenters.find((center) => {
            return (
              center.direction == TerminalDirection.in &&
              center.parameterName == parameterName &&
              center.nodeId == nodeId
            );
          })
        ) {
          const novelCenter = {
            nodeId: nodeId,
            direction: TerminalDirection.in,
            parameterName: parameterName,
            connectionId: null,
            parameterType: inRack.parameterType,
            coords: writable({ x: undefined, y: undefined }),
          };
          novelCenters.push(novelCenter);
        }
      });
      Object.entries(node.racks.out).forEach(([parameterName, outRack]) => {
        const novelCenter = {
          nodeId: nodeId,
          direction: TerminalDirection.out,
          parameterName: parameterName,
          connectionId: null,
          parameterType: outRack.parameterType,
          coords: writable({ x: undefined, y: undefined }),
        };
        novelCenters.push(novelCenter);
      });
    });

    return connectionCenters.concat(novelCenters);
  }
);
