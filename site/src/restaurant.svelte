<script lang="typescript" context="module">
  import { v4 as uuidv4 } from "uuid";

  import { addNode } from "./nodes/nodes";
  import { addConnection } from "./connections/connections";
  import { ColorControl } from "./ingredients/color";

  addNode(new ColorControl().default("color"));

  addConnection({
    connectionId: "init",
    in: {
      nodeId: "plate",
      inputName: "height",
    },
    out: {
      nodeId: "color",
      inputName: "color",
    },
  });

  const defaultNode = () => new ColorControl().default(uuidv4());
</script>

<script lang="typescript">
  import { derived, Unsubscriber, writable, Writable } from "svelte/store";

  import { nodesStore } from "./nodes/nodes";
  import {
    connectionsStore,
    removeConnection,
  } from "./connections/connections";

  import Node from "./nodes/Node.svelte";
  import CursorCircle from "./cursor-circle/CursorCircle.svelte";
  import Cable from "./cable/Cable.svelte";
  import { getContext, setContext } from "svelte";
  import type { NodeRectUpdateCallbacksState } from "./terminals/terminals";
  import { calculateCenter } from "./utils";

  let mouseX: number;
  let mouseY: number;

  function mousemove(event: MouseEvent) {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }

  let holdingCable = false;

  // let anchorTerminal: HTMLElement;

  // let rect = anchorTerminal.getBoundingClientRect();

  function changeViewport() {}

  // store to contain 2 (x, y) coords keyed by connectionId
  let connectionsCoords: Writable<{
    [key: string]: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };
  }> = writable({});

  // set a store for each nodes in context
  // will contain a nested set of callbacks corresponding to inputName and direction
  // these callbacks are used to notify many subscribers of an element rect
  Object.keys($nodesStore).forEach((nodeId: string) => {
    setContext(
      nodeId,
      writable<NodeRectUpdateCallbacksState>({ in: {}, out: {} })
    );
  });

  connectionsStore.subscribe((connections) => {
    // put connectionsCoords updating callbacks in context
    connectionsCoords.update((coords) => {
      return {};
    });
    Object.entries(connections).forEach(([connectionId, connection]) => {
      // callback that will update half of connection's coordinates
      let updateInCoords = (rect: DOMRect) => {
        let center = calculateCenter(rect);
        connectionsCoords.update((coords) => {
          coords[connectionId] = {
            ...coords[connectionId],
            x2: center.x,
            y2: center.y,
          };
          return coords;
        });
      };

      // other half
      let updateOutCoords = (rect: DOMRect) => {
        let center = calculateCenter(rect);
        connectionsCoords.update((coords) => {
          coords[connectionId] = {
            ...coords[connectionId],
            x1: center.x,
            y1: center.y,
          };
          return coords;
        });
      };

      // the context is keyed by nodeId as a string
      // using an object key requires matching the reference
      // maybe pass down through props
      let inKey = connection.in.nodeId;

      // get the node specific store from context
      let inNodeCallbacks: Writable<NodeRectUpdateCallbacksState> =
        getContext(inKey);

      // add to the callbacks set for the given connection's "in" input name
      // this corresponds to the in (left) terminal on inputs
      inNodeCallbacks.update((callbacks: NodeRectUpdateCallbacksState) => {
        if (callbacks.in[connection.in.inputName] === undefined) {
          callbacks.in[connection.in.inputName] = {};
        }
        callbacks.in[connection.in.inputName][connectionId] = updateInCoords;
        return callbacks;
      });

      // do the same for out
      let outKey = connection.out.nodeId;

      let outNodeCallbacks: Writable<NodeRectUpdateCallbacksState> =
        getContext(outKey);

      // using a store to ultimately notify terminals of a new callback to use when
      // they providing updates on their bounding rect
      outNodeCallbacks.update((callbacks: NodeRectUpdateCallbacksState) => {
        if (callbacks.out[connection.out.inputName] === undefined) {
          callbacks.out[connection.out.inputName] = {};
        }
        // use the out callback
        callbacks.out[connection.out.inputName][connectionId] = updateOutCoords;
        return callbacks;
      });
    });
  });

  // need to know when a connection should be deleted
  // this is based on whether its referenced nodes stop existing

  // create derived stores (from nodesStore) that will callback
  // a "check for delete connection" function

  // need to unsubscribe to derived stores so multiple callbacks
  // aren't registered for the same derived node store
  let unsubscribers: Unsubscriber[] = [];

  connectionsStore.subscribe((connections) => {
    // call the unsubscribe functions previously set
    unsubscribers.forEach((unsubscriber) => {
      unsubscriber();
    });

    unsubscribers = [];

    // loop each connection
    Object.entries(connections).forEach(([connectionId, connection]) => {
      let inNodeId = connection.in.nodeId;
      let outNodeId = connection.out.nodeId;

      let inInputName = connection.in.inputName;
      let outInputName = connection.out.inputName;

      // make a derived store with the state of the in node
      let inNode = derived(nodesStore, (nodes) => {
        return nodes[inNodeId];
      });

      // subscribe to changes in the in node's state
      // and remove connection if necessary
      let inUnsubscriber = inNode.subscribe((node) => {
        // node may be removed
        if (node) {
          // type may change
          if (!node.racks.in.includes(inInputName)) {
            removeConnection(connection);
          }
        } else {
          removeConnection(connection);
        }
      });

      // do the same for the out node
      let outNode = derived(nodesStore, (nodes) => {
        return nodes[outNodeId];
      });

      let outUnsubscriber = outNode.subscribe((node) => {
        if (node) {
          if (!node.racks.out.includes(outInputName)) {
            removeConnection(connection);
          }
        } else {
          removeConnection(connection);
        }
      });

      // add these unsubscribers to this list that will be called
      // next time connectionsStore updates
      unsubscribers.push(inUnsubscriber);
      unsubscribers.push(outUnsubscriber);
    });
  });
</script>

<canvas height={window.innerHeight} width={window.innerWidth} />

{#each Object.entries($nodesStore) as [nodeId, node]}
  <Node draggable={true} {...node} />
{/each}

<svelte:window on:mousemove={mousemove} />

<!-- {#if holdingCable}
  <Cable x1={rect} y1={rect} x2={mouseX} y2={mouseY} />
{/if} -->

{#each Object.entries($connectionsCoords) as [connectionId, coords]}
  {#if coords.x1 && coords.y1 && coords.x2 && coords.y2}
    <Cable {...coords} />
  {/if}
{/each}

<CursorCircle on:longpress={() => addNode(defaultNode())} />

<style>
  :global(:root) {
    --tp-button-background-color: hsla(0, 0%, 70%, 1);
    --tp-button-background-color-hover: hsla(0, 0%, 85%, 1);
    --tp-base-background-color: hsla(160, 20%, 75%, 0.8);
    --tp-label-foreground-color: hsla(230, 5%, 30%, 0.7);
    --tp-base-shadow-color: hsla(0, 0%, 0%, 0.2);
    --close-color: hsla(0, 80%, 70%, 0.8);
  }
  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
      "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
      "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #282c34;
    margin: 0px;
  }
  canvas {
    pointer-events: none;
  }
</style>
