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
  import { getContext, setContext } from "svelte";
  import { derived, Unsubscriber, writable, Writable } from "svelte/store";

  import { calculateCenter } from "./utils";

  import { nodesStore } from "./nodes/nodes";
  import {
    connectionsStore,
    removeConnection,
  } from "./connections/connections";

  import Node from "./nodes/Node.svelte";
  import CursorCircle from "./cursor-circle/CursorCircle.svelte";
  import Cable from "./cable/Cable.svelte";

  import type { NodeTerminalRectsUpdateCallbacksState } from "./terminals/terminals";
  import { TerminalDirection } from "./terminals/terminals";
  import { terminalHeight } from "./terminals/TerminalRack.svelte";

  import Terminal from "./terminals/Terminal.svelte";
  import {
    anchorLiveConnectionKey,
    detachLiveConnectionKey,
  } from "./connections/live-connection";

  // store to contain 2 (x, y) coords keyed by connectionId
  let connectionsCoordsStore: Writable<{
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
      writable<NodeTerminalRectsUpdateCallbacksState>({ in: {}, out: {} })
    );
  });

  connectionsStore.subscribe((connections) => {
    // put connectionsCoords updating callbacks in context
    connectionsCoordsStore.update((coords) => {
      return {};
    });
    Object.entries(connections).forEach(([connectionId, connection]) => {
      // callback that will update half of connection's coordinates
      let updateInCoords = (rect: DOMRect) => {
        let center = calculateCenter(rect);
        connectionsCoordsStore.update((coords) => {
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
        connectionsCoordsStore.update((coords) => {
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
      let inNodeCallbacks: Writable<NodeTerminalRectsUpdateCallbacksState> =
        getContext(inKey);

      // add to the callbacks set for the given connection's "in" input name
      // this corresponds to the in (left) terminal on inputs
      inNodeCallbacks.update(
        (callbacks: NodeTerminalRectsUpdateCallbacksState) => {
          if (callbacks.in[connection.in.inputName] === undefined) {
            callbacks.in[connection.in.inputName] = {};
          }
          callbacks.in[connection.in.inputName][connectionId] = updateInCoords;
          return callbacks;
        }
      );

      // do the same for out
      let outKey = connection.out.nodeId;

      let outNodeCallbacks: Writable<NodeTerminalRectsUpdateCallbacksState> =
        getContext(outKey);

      // using a store to ultimately notify terminals of a new callback to use when
      // they providing updates on their bounding rect
      outNodeCallbacks.update(
        (callbacks: NodeTerminalRectsUpdateCallbacksState) => {
          if (callbacks.out[connection.out.inputName] === undefined) {
            callbacks.out[connection.out.inputName] = {};
          }
          // use the out callback
          callbacks.out[connection.out.inputName][connectionId] =
            updateOutCoords;
          return callbacks;
        }
      );
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
            removeConnection(connection.connectionId);
          }
        } else {
          removeConnection(connection.connectionId);
        }
      });

      // do the same for the out node
      let outNode = derived(nodesStore, (nodes) => {
        return nodes[outNodeId];
      });

      let outUnsubscriber = outNode.subscribe((node) => {
        if (node) {
          if (!node.racks.out.includes(outInputName)) {
            removeConnection(connection.connectionId);
          }
        } else {
          removeConnection(connection.connectionId);
        }
      });

      // add these unsubscribers to this list that will be called
      // next time connectionsStore updates
      unsubscribers.push(inUnsubscriber);
      unsubscribers.push(outUnsubscriber);
    });
  });

  let dragTerminalDirection: TerminalDirection;

  // store a single set of coords for when a cable is being dragged
  let liveCoordsStore: Writable<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }> = writable();

  let updateLiveInCoords = (rect: DOMRect) => {
    let center = calculateCenter(rect);
    liveCoordsStore.update((coords) => {
      coords = {
        ...coords,
        x2: center.x,
        y2: center.y,
      };
      return coords;
    });
  };

  let updateLiveOutCoords = (rect: DOMRect) => {
    let center = calculateCenter(rect);
    liveCoordsStore.update((coords) => {
      coords = {
        ...coords,
        x1: center.x,
        y1: center.y,
      };
      return coords;
    });
  };

  let holdingCable = false;

  let mouseX: number;
  let mouseY: number;

  function anchorLiveConnection(
    direction: TerminalDirection,
    location: { x: number; y: number }
  ): (rect: DOMRect) => void {
    let updateLiveCoords: (rect: DOMRect) => void;

    if (direction == TerminalDirection.in) {
      updateLiveCoords = updateLiveInCoords;
      dragTerminalDirection = TerminalDirection.out;
    } else {
      updateLiveCoords = updateLiveOutCoords;
      dragTerminalDirection = TerminalDirection.in;
    }

    mouseX = location.x;
    mouseY = location.y;

    holdingCable = true;

    return updateLiveCoords;
  }

  function detachLiveConnection(
    connectionId: string,
    direction: TerminalDirection
  ) {
    removeConnection(connectionId);

    holdingCable = true;
  }

  setContext(anchorLiveConnectionKey, anchorLiveConnection);
  setContext(detachLiveConnectionKey, detachLiveConnection);

  function dragTerminal(element: HTMLElement) {
    let dragTerminalTimer: NodeJS.Timer;

    element.style.top = mouseY + "px";
    element.style.left = mouseX + "px";

    let moveElement = (event: MouseEvent) => {
      event.preventDefault();
      element.style.top = event.y + "px";
      element.style.left = event.x + "px";
    };
    window.addEventListener("mousemove", moveElement);
    dragTerminalTimer = setInterval(() => {
      let rect = element.getBoundingClientRect();
      if (dragTerminalDirection == TerminalDirection.in) {
        updateLiveInCoords(rect);
      } else if (dragTerminalDirection == TerminalDirection.out) {
        updateLiveOutCoords(rect);
      }
    }, 10);
    return {
      destroy() {
        window.removeEventListener("mousemove", moveElement);
        clearInterval(dragTerminalTimer);
        liveCoordsStore.set(undefined);
      },
    };
  }
</script>

<svelte:window
  on:scroll|preventDefault={() => {}}
  on:mouseup={() => {
    holdingCable = false;
  }}
/>

<canvas height={window.innerHeight} width={window.innerWidth} />

{#each Object.entries($nodesStore) as [nodeId, node] (nodeId)}
  <Node draggable={true} {...node} />
{/each}

{#if holdingCable}
  {#if $liveCoordsStore && $liveCoordsStore.x1 && $liveCoordsStore.y1 && $liveCoordsStore.x2 && $liveCoordsStore.y2}
    <Cable {...$liveCoordsStore} />
  {/if}
  <Terminal
    actionDescription={{
      action: dragTerminal,
    }}
    direction={dragTerminalDirection}
    expanded={true}
    cabled={true}
    live={holdingCable}
    {terminalHeight}
  />
{/if}

{#each Object.entries($connectionsCoordsStore) as [connectionId, coords]}
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
    /* --cable-color-number: hsla(214, 35%, 60.8%, 0.8); */
    --cable-color-number: #99a6bf;
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
