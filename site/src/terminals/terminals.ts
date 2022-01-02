import { derived, writable, Writable } from "svelte/store";
import { connectionsStore } from "../connections/connections";
import { liveConnectionStore } from "../connections/live-connection";

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
  [connectionsStore, liveConnectionStore],
  ([connections, liveConnection]) => {
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

    // if (liveConnection) {
    //   nodesCenters.push({
    //     nodeId: liveConnection.anchorNodeId,
    //     direction: liveConnection.dragTerminalDirection,
    //     inputName: liveConnection.anchorInputName,
    //     connectionId: liveConnection.connectionId,
    //     coords: writable({ x: undefined, y: undefined }),
    //   });
    // }

    return nodesCenters;
  }
);
