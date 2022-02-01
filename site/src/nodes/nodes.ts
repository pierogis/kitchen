import { derived, Readable, Writable, writable } from "svelte/store";
import type { ParameterType } from "../connections/connections";

export type NodeParameters = {
  [key: string]: any;
};

export type RackState = {
  parameterType: ParameterType;
};

export type RacksState = {
  in: { [parameterName: string]: RackState };
  out: { [parameterName: string]: RackState };
};

export interface NodeState<P extends NodeParameters> {
  nodeId: string;
  type: string;
  coords: Writable<{
    x: number;
    y: number;
  }>;
  parameters: Writable<P>;
  racks: RacksState;
}

export const nodesStore: Writable<{ [nodeId: string]: NodeState<any> }> =
  writable({});

export const nodesRacksStore: Readable<{ [nodeId: string]: RacksState }> =
  derived(nodesStore, (nodes) => {
    return Object.entries(nodes).reduce((nodesRacks, [nodeId, node]) => {
      nodesRacks[nodeId] = node.racks;
      return nodesRacks;
    }, {});
  });

export function addNode(node: NodeState<any>) {
  nodesStore.update(($nodes) => {
    $nodes[node.nodeId] = node;
    return $nodes;
  });
}
export function updateNode(node: NodeState<any>) {
  nodesStore.update(($nodes) => {
    $nodes[node.nodeId] = node;
    return $nodes;
  });
}
export function removeNode(node: NodeState<any>) {
  nodesStore.update(($nodes) => {
    delete $nodes[node.nodeId];
    return $nodes;
  });
}
