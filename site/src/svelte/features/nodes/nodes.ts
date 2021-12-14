import { get, Writable, writable } from "svelte/store";
import { viewportStore } from "../viewport/viewport";

export type NodeProperties = {
  [key: string]: any;
};

export type RacksState = {
  in: string[];
  out: string[];
};

export interface NodeState {
  id: string;
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
    id: "plate",
    type: "plate",
    style: "top: 50%; right: 0px;",
    properties: initialProps,
    racks: initialRacks,
  },
};

export const nodesStore: Writable<{ [key: string]: NodeState }> =
  writable(initialState);

export function addNode(node: NodeState) {
  nodesStore.update(($nodes) => {
    $nodes[node.id] = node;
    return $nodes;
  });
}
export function updateNode(node: NodeState) {
  nodesStore.update(($nodes) => {
    $nodes[node.id] = node;
    return $nodes;
  });
}
export function deleteNode(node: NodeState) {
  nodesStore.update(($nodes) => {
    delete $nodes[node.id];
    return $nodes;
  });
}
