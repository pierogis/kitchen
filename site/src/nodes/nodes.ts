import { derived, Readable, Writable, writable } from "svelte/store";
import type { ParameterType } from "../connections/connections";

export type NodeProperties = {
  [key: string]: any;
};

export type RackState = {
  parameterType: ParameterType;
};

export type RacksState = {
  in: { [parameterName: string]: RackState };
  out: { [parameterName: string]: RackState };
};

export interface NodeState {
  nodeId: string;
  type: string;
  style: string;
  properties: NodeProperties;
  racks: RacksState;
}

// let initialPlateProps = get(viewportStore);

// let initialPlateRacks = { in: [], out: [] };
// initialPlateRacks.in = Object.keys(initialPlateProps)

export const nodesStore: Writable<{ [nodeId: string]: NodeState }> = writable(
  {}
);

export const nodesRacksStore: Readable<{ [nodeId: string]: RacksState }> =
  derived(nodesStore, (nodes) => {
    return Object.entries(nodes).reduce((nodesRacks, [nodeId, node]) => {
      nodesRacks[nodeId] = node.racks;
      return nodesRacks;
    }, {});
  });

export function addNode(node: NodeState) {
  nodesStore.update(($nodes) => {
    $nodes[node.nodeId] = node;
    return $nodes;
  });
}
export function updateNode(node: NodeState) {
  nodesStore.update(($nodes) => {
    $nodes[node.nodeId] = node;
    return $nodes;
  });
}
export function removeNode(node: NodeState) {
  nodesStore.update(($nodes) => {
    delete $nodes[node.nodeId];
    return $nodes;
  });
}
