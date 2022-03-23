<script lang="ts" context="module">
  const NOVEL_CONNECTION_ID = "novel";
</script>

<script lang="ts">
  import { v4 as uuidv4 } from "uuid";
  import { getContext } from "svelte";
  import { derived, Readable } from "svelte/store";

  import cssVars from "svelte-css-vars";

  import {
    allNodesTerminalCentersStore,
    NodeTerminalCentersState,
    TerminalDirection,
    terminalHeight,
  } from "./terminals";
  import {
    anchorLiveConnection,
    LiveConnectionState,
    liveConnectionStore,
  } from "../connections/live-connection";
  import type { ActionDescription } from "../common/actions/useActions";
  import { checkNearAction } from "../common/actions/checkNear";
  import { calculateCenter } from "../common/utils";
  import {
    ParameterType,
    connectionsStore,
    removeConnection,
  } from "../connections/connections";
  import Terminal from "./Terminal.svelte";

  export let direction: TerminalDirection;
  export let container: HTMLElement;

  let near: boolean = false;

  export let parameterName: string;
  export let parameterType: ParameterType;

  const nearTerminalRackDistance = 12;
  const rackHeight = 20;

  const paneOffset = 6;

  const nodeId: string = getContext("nodeId");

  // get store containing coord stores to use to broadcast bounding rect
  // look for matching node, parameter name, direction
  const nodeTerminalRectCenterStores: Readable<{
    [connectionId: string]: NodeTerminalCentersState;
  }> = derived(
    [allNodesTerminalCentersStore, liveConnectionStore],
    ([allNodeTerminalCenters, liveConnection]: [
      NodeTerminalCentersState[],
      LiveConnectionState
    ]) => {
      let nodeCenters = allNodeTerminalCenters.filter((center) => {
        return (
          center.nodeId == nodeId &&
          center.direction == direction &&
          center.parameterName == parameterName
        );
      });

      let centerStores = nodeCenters.reduce<{
        [connectionId: string]: NodeTerminalCentersState;
      }>((currentCenterStores, center) => {
        if (center.connectionId) {
          currentCenterStores[center.connectionId] = center;
        } else {
          currentCenterStores[NOVEL_CONNECTION_ID] = center;
        }
        return currentCenterStores;
      }, {});

      // add a rect center store to update from the live connection
      if (
        liveConnection &&
        liveConnection.anchorNodeId == nodeId &&
        liveConnection.anchorTerminalDirection == direction &&
        liveConnection.anchorParameterName == parameterName
      ) {
        centerStores[liveConnection.connectionId] = {
          nodeId: nodeId,
          direction: direction,
          parameterName: parameterName,
          connectionId: liveConnection.connectionId,
          parameterType: liveConnection.parameterType,
          coords: liveConnection.anchorCoordsStore,
        };
        if (direction == TerminalDirection.in) {
          delete centerStores[NOVEL_CONNECTION_ID];
        }
      }

      return centerStores;
    },
    {}
  );

  function terminalCenterUpdateAction(
    element: HTMLElement,
    params: { connectionId: string }
  ) {
    let updateRect = () => {
      // don't bother if there are none to call
      if (
        $nodeTerminalRectCenterStores &&
        Object.entries($nodeTerminalRectCenterStores).length > 0
      ) {
        // calculate the rect and dispatch to the callback
        let rect: DOMRect = element.getBoundingClientRect();
        // accounts for scroll
        rect.x += window.pageXOffset;
        rect.y += window.pageYOffset;
        let center = calculateCenter(rect);
        $nodeTerminalRectCenterStores[params.connectionId].coords.set({
          x: center.x,
          y: center.y,
        });
      }
    };

    let rectUpdateInterval = setInterval(updateRect, 10);
    return {
      update(newParams: { connectionId: string }) {
        params = newParams;
      },
      destroy() {
        clearInterval(rectUpdateInterval);
      },
    };
  }
  let usingNovelTerminal = false;

  // grabbing novel terminal should start relaying the coords of the terminal
  // and add event listeners for release
  function handleNovelGrabAction(
    element: HTMLElement,
    params: { connectionId: string }
  ) {
    const handleMouseUp = (event: MouseEvent) => {
      usingNovelTerminal = false;
      window.removeEventListener("mouseup", handleMouseUp);
      element.style.cursor = "";
    };

    const handleNovelGrab = (event: MouseEvent) => {
      if (event.button == 0) {
        const dragDirection =
          direction == TerminalDirection.in
            ? TerminalDirection.out
            : TerminalDirection.in;
        anchorLiveConnection(
          params.connectionId,
          nodeId,
          parameterName,
          direction,
          dragDirection,
          parameterType,
          {
            x: event.x,
            y: event.y,
          }
        );
        usingNovelTerminal = true;
        window.addEventListener("mouseup", handleMouseUp);
        element.style.cursor = "grabbing";
      }
    };

    element.addEventListener("mousedown", handleNovelGrab);

    return {
      update(newParams: { connectionId: string }) {
        params = newParams;
      },
      destroy() {
        element.removeEventListener("mousedown", handleNovelGrab);
      },
    };
  }

  function handleDisconnectGrabAction(
    element: HTMLElement,
    params: { connectionId: string }
  ) {
    let handleMouseUp = () => {
      element.style.cursor = "";
      window.removeEventListener("mouseup", handleMouseUp);
    };

    let handleDisconnectGrab = (event: MouseEvent) => {
      if (event.button == 0) {
        let location = {
          x: event.x,
          y: event.y,
        };
        const connection = $connectionsStore[params.connectionId];

        // anchorDirection is the opposite of the direction that engaged
        // this callback
        const anchorDirection =
          direction == TerminalDirection.in
            ? TerminalDirection.out
            : TerminalDirection.in;

        const parameterType = connection.parameterType;

        const { nodeId: anchorNodeId, parameterName: anchorParameterName } =
          connection[anchorDirection];
        removeConnection(params.connectionId);

        anchorLiveConnection(
          params.connectionId,
          anchorNodeId,
          anchorParameterName,
          anchorDirection,
          direction,
          parameterType,
          location
        );

        element.style.cursor = "grabbing";
        window.addEventListener("mouseup", handleMouseUp);
      }
    };

    element.addEventListener("mousedown", handleDisconnectGrab);

    return {
      update(newParams: { connectionId: string }) {
        params = newParams;
      },
      destroy() {
        element.removeEventListener("mousedown", handleDisconnectGrab);
      },
    };
  }

  $: connectionIds = $nodeTerminalRectCenterStores
    ? Object.keys($nodeTerminalRectCenterStores)
    : [];

  $: expanded = near || usingNovelTerminal;

  let terminals: {
    actionDescriptions: ActionDescription<any>[];
    cabled: boolean;
  }[];
  $: {
    let showNovelTerminal;
    terminals = [...connectionIds].reduce<
      {
        actionDescriptions: ActionDescription<any>[];
        cabled: boolean;
      }[]
    >((result, connectionId) => {
      if (connectionId != NOVEL_CONNECTION_ID) {
        const terminal = {
          actionDescriptions: [
            {
              action: terminalCenterUpdateAction,
              params: { connectionId: connectionId },
            },
            {
              action: handleDisconnectGrabAction,
              params: { connectionId: connectionId },
            },
          ],
          cabled: true,
        };

        result.push(terminal);
      } else {
        showNovelTerminal = true;
      }

      return result;
    }, []);

    if (showNovelTerminal) {
      const novelTerminal = {
        actionDescriptions: [
          {
            action: terminalCenterUpdateAction,
            params: { connectionId: NOVEL_CONNECTION_ID },
          },
          {
            action: handleNovelGrabAction,
            params: { connectionId: uuidv4() },
          },
        ],
        cabled: false,
      };

      terminals.push(novelTerminal);
    }
  }

  // if expanded, take a width dependent on the number of terminals
  // 1 more terminal than there are connections
  $: rackWidth = !expanded
    ? 4
    : ((rackHeight - terminalHeight) / 2) * (terminals.length + 1) +
      terminalHeight * terminals.length;

  $: styleVars = {
    rackWidth: rackWidth + "px",
    rackHeight: rackHeight + "px",
    paneOffset: paneOffset + "px",
  };
</script>

<div
  bind:this={container}
  class="terminal-rack {direction}"
  use:cssVars={styleVars}
  use:checkNearAction={nearTerminalRackDistance}
  on:near={(event) => {
    near = event.detail;
  }}
>
  <div class="terminals-container" class:expanded use:cssVars={styleVars}>
    {#each Object.entries(terminals) as [connectionId, terminal] (connectionId)}
      <Terminal
        actionDescriptions={terminal.actionDescriptions}
        cabled={terminal.cabled}
        {direction}
        {expanded}
        {terminalHeight}
      />
    {/each}
  </div>
</div>

<style>
  .terminal-rack {
    display: flex;
    align-items: center;

    border-radius: 6px 6px 6px 6px;
    background-color: var(--primary-color);
    box-shadow: 0 2px 4px var(--tp-base-shadow-color);

    position: relative;
    width: var(--rackWidth);
    height: var(--rackHeight);
    transition: width 300ms, margin 300ms, left 300ms, right 300ms;
  }

  .terminal-rack:hover {
    transition: all 0s;
  }

  .terminals-container {
    display: flex;
    align-items: center;
    justify-content: space-evenly;

    width: 10px;
    transition: width 300ms;
  }

  .terminals-container.expanded {
    width: var(--rackWidth);
    transition: width 0ms;
  }

  .in {
    flex-direction: row-reverse;
    right: calc(var(--rackWidth) + var(--paneOffset));
    margin-right: calc(0px - var(--rackWidth));
  }

  .out {
    left: calc(var(--rackWidth) + var(--paneOffset));
    margin-left: calc(0px - var(--rackWidth));
  }
</style>
