<script lang="typescript" context="module">
  import { v4 as uuidv4 } from "uuid";

  import { addNode } from "./nodes/nodes";
  import {
    addConnection,
    ConnectionInputType,
  } from "./connections/connections";
  import { ColorControl } from "./ingredients/color";

  addNode(new ColorControl().default("color"));

  addConnection({
    connectionId: "init",
    inputType: ConnectionInputType.number,
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
  import { setContext } from "svelte";
  import { derived, Unsubscriber, writable, Writable } from "svelte/store";

  import { calculateCenter } from "./common/utils";

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
    disconnectLiveConnectionKey,
    liveTerminalKey,
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
  let nodeIds = Object.keys($nodesStore);
  let allNodesTerminalRectsUpdateCallbacksStore: Writable<{
    [nodeId: string]: { in: {}; out: {} };
  }> = writable({
    ...Object.fromEntries(
      nodeIds.map((nodeId) => [nodeId, { in: {}, out: {} }])
    ),
  });

  nodeIds.forEach((nodeId: string) => {
    setContext(
      nodeId,
      derived(allNodesTerminalRectsUpdateCallbacksStore, (nodesCallbacks) => {
        return nodesCallbacks[nodeId];
      })
    );
  });

  connectionsStore.subscribe((connections) => {
    // put connectionsCoords updating callbacks in context
    connectionsCoordsStore.set({});
    allNodesTerminalRectsUpdateCallbacksStore.set({
      ...Object.fromEntries(
        nodeIds.map((nodeId) => [nodeId, { in: {}, out: {} }])
      ),
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
      let inNodeId = connection.in.nodeId;
      // do the same for out
      let outNodeId = connection.out.nodeId;

      // get the node specific store from context

      // add to the callbacks set for the given connection's "in" input name
      // this corresponds to the in (left) terminal on inputs

      // using a store to ultimately notify terminals of a new callback to use when
      // they providing updates on their bounding rect
      allNodesTerminalRectsUpdateCallbacksStore.update(
        (allNodesCallbacks: {
          [nodeId: string]: NodeTerminalRectsUpdateCallbacksState;
        }) => {
          if (
            allNodesCallbacks[outNodeId].out[connection.out.inputName] ===
            undefined
          ) {
            allNodesCallbacks[outNodeId].out[connection.out.inputName] = {};
          }
          // use the out callback
          allNodesCallbacks[outNodeId].out[connection.out.inputName][
            connectionId
          ] = updateOutCoords;

          if (
            allNodesCallbacks[inNodeId].in[connection.in.inputName] ===
            undefined
          ) {
            allNodesCallbacks[inNodeId].in[connection.in.inputName] = {};
          }
          allNodesCallbacks[inNodeId].in[connection.in.inputName][
            connectionId
          ] = updateInCoords;

          return allNodesCallbacks;
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

  // store a single set of coords for when a cable is being dragged
  const liveCoordsStore: Writable<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }> = writable();

  const updateLiveInCoords = (rect: DOMRect) => {
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

  const updateLiveOutCoords = (rect: DOMRect) => {
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

  const liveTerminalStore: Writable<{
    // only react if this a compatible terminal
    anchorNodeId: string;
    anchorInputName: string;
    inputType: ConnectionInputType;
    dragTerminalDirection: TerminalDirection;
    // call this when releasing the live terminal, if this live cable is compatible
    attach: () => void;
  } | null> = writable(null);
  setContext(
    liveTerminalKey,
    derived(liveTerminalStore, (liveTerminal) => liveTerminal)
  );

  let mouseX: number;
  let mouseY: number;

  function anchorLiveConnection(
    direction: TerminalDirection,
    location: { x: number; y: number },
    inputType: ConnectionInputType,
    nodeId: string,
    inputName: string
  ) {
    let dragTerminalDirection;
    if (direction == TerminalDirection.in) {
      dragTerminalDirection = TerminalDirection.out;
    } else {
      dragTerminalDirection = TerminalDirection.in;
    }

    mouseX = location.x;
    mouseY = location.y;

    liveTerminalStore.set({
      anchorNodeId: nodeId,
      anchorInputName: inputName,
      inputType: inputType,
      dragTerminalDirection: dragTerminalDirection,
      attach: () => {},
    });
  }

  // create a live connection by disconnecting and existing one
  function disconnectLiveConnection(
    connectionId: string,
    direction: TerminalDirection,
    location: { x: number; y: number }
  ) {
    const connection = $connectionsStore[connectionId];

    // anchorDirection is the opposite of the direction that engaged
    // this callback
    const anchorDirection =
      direction == TerminalDirection.in
        ? TerminalDirection.out
        : TerminalDirection.in;

    const inputType = connection.inputType;

    const { nodeId: anchorNodeId, inputName: anchorInputName } =
      connection[anchorDirection];
    removeConnection(connectionId);

    mouseX = location.x;
    mouseY = location.y;

    liveTerminalStore.set({
      anchorNodeId: anchorNodeId,
      anchorInputName: anchorInputName,
      inputType: inputType,
      dragTerminalDirection: direction,
      attach: () => {},
    });
  }

  let liveAnchorNodeId: string;
  let liveAnchorTerminalDirection: TerminalDirection;
  let liveAnchorInputName: string;

  $: if ($liveTerminalStore) {
    liveAnchorNodeId = $liveTerminalStore.anchorNodeId;
    liveAnchorInputName = $liveTerminalStore.anchorInputName;

    // use an update live coords callback on the anchored terminal
    let updateLiveCoords: (rect: DOMRect) => void;

    if ($liveTerminalStore.dragTerminalDirection == TerminalDirection.in) {
      updateLiveCoords = updateLiveOutCoords;
      liveAnchorTerminalDirection = TerminalDirection.out;
    } else {
      updateLiveCoords = updateLiveInCoords;
      liveAnchorTerminalDirection = TerminalDirection.in;
    }

    allNodesTerminalRectsUpdateCallbacksStore.update((allNodesCallbacks) => {
      // TODO: logic here to keep the nodes in the right order
      allNodesCallbacks[liveAnchorNodeId][liveAnchorTerminalDirection][
        liveAnchorInputName
      ] = {
        ...allNodesCallbacks[liveAnchorNodeId][liveAnchorTerminalDirection][
          liveAnchorInputName
        ],
        live: updateLiveCoords,
      };
      return allNodesCallbacks;
    });
  } else {
    if (
      liveAnchorNodeId &&
      liveAnchorTerminalDirection &&
      liveAnchorInputName
    ) {
      // remove the live position callback from this input terminal
      allNodesTerminalRectsUpdateCallbacksStore.update((allNodesCallbacks) => {
        delete allNodesCallbacks[liveAnchorNodeId][liveAnchorTerminalDirection][
          liveAnchorInputName
        ]["live"];
        return allNodesCallbacks;
      });
    }
  }

  setContext(anchorLiveConnectionKey, anchorLiveConnection);
  setContext(disconnectLiveConnectionKey, disconnectLiveConnection);

  function dragTerminalAction(
    element: HTMLElement,
    params: { direction: TerminalDirection }
  ) {
    let dragTerminalTimer: NodeJS.Timer;

    element.style.top = mouseY + "px";
    element.style.left = mouseX + "px";

    const moveTerminal = (event: MouseEvent) => {
      event.preventDefault();
      element.style.top = event.y + "px";
      element.style.left = event.x + "px";
    };
    window.addEventListener("mousemove", moveTerminal);

    dragTerminalTimer = setInterval(() => {
      const rect = element.getBoundingClientRect();
      if (params.direction == TerminalDirection.in) {
        updateLiveInCoords(rect);
      } else if (params.direction == TerminalDirection.out) {
        updateLiveOutCoords(rect);
      }
    }, 10);

    // update restaurant that cable has been dropped
    const dropCable = () => {
      liveTerminalStore.set(null);
      window.removeEventListener("mouseup", dropCable);
    };
    window.addEventListener("mouseup", dropCable);

    return {
      update(newParams: { direction: TerminalDirection }) {
        params = newParams;
      },
      destroy() {
        window.removeEventListener("mousemove", moveTerminal);
        window.removeEventListener("mouseup", dropCable);
        clearInterval(dragTerminalTimer);
        liveCoordsStore.set(undefined);
      },
    };
  }
</script>

<svelte:window on:scroll|preventDefault={() => {}} />

<canvas height={window.innerHeight} width={window.innerWidth} />

{#each Object.entries($nodesStore) as [nodeId, node] (nodeId)}
  <Node draggable={true} {...node} />
{/each}

{#if $liveTerminalStore}
  {#if $liveCoordsStore && $liveCoordsStore.x1 && $liveCoordsStore.y1 && $liveCoordsStore.x2 && $liveCoordsStore.y2}
    <Cable {...$liveCoordsStore} />
  {/if}
  <Terminal
    actionDescriptions={[
      {
        action: dragTerminalAction,
        params: { direction: $liveTerminalStore.dragTerminalDirection },
      },
    ]}
    direction={$liveTerminalStore.dragTerminalDirection}
    expanded={true}
    cabled={true}
    live={true}
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
