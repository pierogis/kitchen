<script lang="ts">
  import { v4 as uuidv4 } from "uuid";
  import { beforeUpdate, setContext } from "svelte";

  import { derived, Unsubscriber, Readable, Writable } from "svelte/store";
  import Cable from "../cable/Cable.svelte";
  import { calculateCenter } from "../common/utils";
  import { nodesStore } from "../nodes/nodes";
  import {
    allNodesTerminalCentersStore,
    NodeTerminalCentersState,
    TerminalDirection,
  } from "../terminals/terminals";
  import {
    addConnection,
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

  // store to contain 2 (x, y) coords keyed by connectionId
  let connectionsCoordsStore: Readable<{
    [connectionId: string]: {
      in: Writable<{
        x: number;
        y: number;
      }>;
      out: Writable<{
        x: number;
        y: number;
      }>;
    };
  }> = derived(allNodesTerminalCentersStore, (nodesTerminalCenters) => {
    let allCoords = {};
    nodesTerminalCenters.forEach((terminalCenter) => {
      if (!allCoords[terminalCenter.connectionId]) {
        allCoords[terminalCenter.connectionId] = { in: null, out: null };
      }
      allCoords[terminalCenter.connectionId][terminalCenter.direction] =
        terminalCenter.coords;
    });

    return allCoords;
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
    let dragTerminalDirection: TerminalDirection;
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
      connectionId: uuidv4(),
      anchorNodeId: anchorNodeId,
      anchorInputName: anchorInputName,
      inputType: anchorInputType,
      anchorTerminalDirection: anchorDirection,
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
      connectionId: connectionId,
      anchorNodeId: anchorNodeId,
      anchorInputName: anchorInputName,
      inputType: inputType,
      anchorTerminalDirection: anchorDirection,
      dragTerminalDirection: direction,
      attach: () => {},
    });
  }

  setContext(anchorLiveConnectionKey, anchorLiveConnection);
  setContext(disconnectLiveConnectionKey, disconnectLiveConnection);
</script>

<slot />

{#each Object.entries($connectionsCoordsStore) as [connectionId, coords]}
  <Cable inCoords={coords.in} outCoords={coords.out} />
{/each}

<LiveConnection {mouseX} {mouseY} />
