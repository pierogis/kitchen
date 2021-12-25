<script lang="ts">
  import { beforeUpdate, setContext } from "svelte";

  import { derived, Unsubscriber, Writable, writable } from "svelte/store";
  import Cable from "../cable/Cable.svelte";
  import { calculateCenter } from "../common/utils";
  import { nodesStore } from "../nodes/nodes";
  import {
    NodeTerminalRectsUpdateCallbacksState,
    TerminalDirection,
  } from "../terminals/terminals";
  import {
    addConnection,
    allNodesTerminalRectsUpdateCallbacksKey,
    ConnectionInputType,
    connectionsStore,
    removeConnection,
  } from "./connections";
  import {
    anchorLiveConnectionKey,
    disconnectLiveConnectionKey,
    liveConnectionStore,
  } from "./live-connection";
  import LiveConnection from "./LiveConnection.svelte";

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
  setContext(
    allNodesTerminalRectsUpdateCallbacksKey,
    allNodesTerminalRectsUpdateCallbacksStore
  );

  nodeIds.forEach((nodeId: string) => {
    setContext(
      nodeId,
      derived(allNodesTerminalRectsUpdateCallbacksStore, (nodesCallbacks) => {
        return nodesCallbacks[nodeId];
      })
    );
  });

  // let nodeIdsStore = derived(nodesStore, (nodes) => {
  //   return Object.keys(nodes);
  // });

  // let allNodesTerminalRectsUpdateCallbacksStore = derived(
  //   [nodeIdsStore, connectionsStore],
  //   ([nodeIds, connections]) => {
  //     let callbacks = {
  //       ...Object.fromEntries(
  //         nodeIds.map((nodeId) => [nodeId, { in: {}, out: {} }])
  //       ),
  //     };
  //   }
  // );

  // store to contain 2 (x, y) coords keyed by connectionId
  let connectionsCoordsStore: Writable<{
    [key: string]: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };
  }> = writable({});

  // nodeIdsStore.subscribe((nodeIds) => {});

  connectionsStore.subscribe((connections) => {
    // update all of the connections coords callbacks
    connectionsCoordsStore.set({});

    // reset all the terminal rect callbacks
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

  let mouseX: number;
  let mouseY: number;

  // probably should make these into one function
  function anchorLiveConnection(
    anchorDirection: TerminalDirection,
    location: { x: number; y: number },
    anchorInputType: ConnectionInputType,
    anchorNodeId: string,
    anchorInputName: string
  ) {
    let dragTerminalDirection;
    let attach: (targetNodeId: string, targetInputName: string) => void;
    // when a terminal gets a mouseup, add a new connection depending on the in/out
    // TODO: this code should be the same for disconnectLiveConnection
    if (anchorDirection == TerminalDirection.in) {
      dragTerminalDirection = TerminalDirection.out;
      attach = (targetNodeId: string, targetInputName: string) => {
        console.log("out");
        addConnection({
          connectionId: "new",
          inputType: anchorInputType,
          in: {
            nodeId: anchorNodeId,
            inputName: anchorInputName,
          },
          out: {
            nodeId: targetNodeId,
            inputName: targetInputName,
          },
        });
      };
    } else {
      dragTerminalDirection = TerminalDirection.in;
      attach = (targetNodeId: string, targetInputName: string) => {
        console.log("in");
        addConnection({
          connectionId: "new",
          inputType: anchorInputType,
          in: {
            nodeId: targetNodeId,
            inputName: targetInputName,
          },
          out: {
            nodeId: anchorNodeId,
            inputName: anchorInputName,
          },
        });
      };
    }

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

    mouseX = location.x;
    mouseY = location.y;

    liveConnectionStore.set({
      anchorNodeId: anchorNodeId,
      anchorInputName: anchorInputName,
      inputType: anchorInputType,
      dragTerminalDirection: dragTerminalDirection,
      attach: attach,
    });
  }

  // create a live connection by disconnecting an existing one
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

    liveConnectionStore.set({
      anchorNodeId: anchorNodeId,
      anchorInputName: anchorInputName,
      inputType: inputType,
      dragTerminalDirection: direction,
      attach: () => {},
    });
  }

  setContext(anchorLiveConnectionKey, anchorLiveConnection);
  setContext(disconnectLiveConnectionKey, disconnectLiveConnection);
</script>

<slot />

{#each Object.entries($connectionsCoordsStore) as [connectionId, coords]}
  {#if coords.x1 && coords.y1 && coords.x2 && coords.y2}
    <Cable {...coords} />
  {/if}
{/each}

<LiveConnection {mouseX} {mouseY} />
