import { derived, get, Readable, Writable, writable } from "svelte/store";
import { viewportStore } from "../viewport/viewport";

export type NodeProperties = {
  [key: string]: any;
};

export type RacksState = {
  in: string[];
  out: string[];
};

export interface NodeState {
  nodeId: string;
  type: string;
  style: string;
  properties: NodeProperties;
  racks: RacksState;
}

let initialProps = get(viewportStore);

let initialRacks = { in: [], out: [] };
Object.keys(initialProps).forEach((key) => {
  initialRacks.in.push(key);
});

const initialState = {
  plate: {
    nodeId: "plate",
    type: "plate",
    style: "top: 50%; right: 0px;",
    properties: initialProps,
    racks: initialRacks,
  },
};

export const nodesStore: Writable<{ [nodeId: string]: NodeState }> =
  writable(initialState);

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
export function deleteNode(node: NodeState) {
  nodesStore.update(($nodes) => {
    delete $nodes[node.nodeId];
    return $nodes;
  });
}
