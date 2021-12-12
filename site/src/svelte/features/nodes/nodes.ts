import { Writable, writable } from "svelte/store";

export interface NodeState {
  id: string;
  type: string;
  style: string;
  properties: {
    [key: string]: any
  }
}

const initialState = {
  plate: {
    id: "plate",
    type: "plate",
    style: "top: 50%; right: 0px;",
    properties: {}
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
  console.log(node)
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
