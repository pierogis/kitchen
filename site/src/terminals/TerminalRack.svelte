<script lang="ts" context="module">
  export const terminalHeight = 10;
</script>

<script lang="ts">
  import { v4 as uuidv4 } from "uuid";
  import { getContext } from "svelte";
  import { derived, Readable } from "svelte/store";

  import cssVars from "svelte-css-vars";

  import {
    allNodesTerminalCentersStore,
    disconnectLiveConnection,
    NodeTerminalCentersState,
    TerminalDirection,
  } from "./terminals";
  import {
    createLiveConnection,
    LiveConnectionState,
    liveConnectionStore,
  } from "../connections/live-connection";
  import type { ActionDescription } from "../common/actions/useActions";
  import { checkNearAction } from "../common/actions/checkNear";
  import { calculateCenter, checkPointWithinBox } from "../common/utils";
  import { ConnectionInputType } from "../connections/connections";
  import Terminal from "./Terminal.svelte";

  export let direction: TerminalDirection;
  export let container: HTMLElement;

  let near: boolean = false;

  export let inputName: string;

  const nearTerminalRackDistance = 12;
  const rackHeight = 20;

  const paneOffset = 6;

  const nodeId: string = getContext("nodeId");

  // get store containing coord stores to use to broadcast bounding rect
  // look for matching node, input name, direction
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
          center.inputName == inputName
        );
      });

      let centerStores: {
        [connectionId: string]: NodeTerminalCentersState;
      } = nodeCenters.reduce((prev, center) => {
        prev[center.connectionId] = center;
        return prev;
      }, {});

      // add a rect center store to update from the live connection
      if (
        liveConnection &&
        liveConnection.anchorNodeId == nodeId &&
        liveConnection.anchorTerminalDirection == direction &&
        liveConnection.anchorInputName == inputName
      ) {
        centerStores[liveConnection.connectionId] = {
          nodeId: nodeId,
          direction: direction,
          inputName: inputName,
          connectionId: liveConnection.connectionId,
          coords: liveConnection.anchorCoordsStore,
        };
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
        createLiveConnection(
          params.connectionId,
          nodeId,
          inputName,
          direction,
          dragDirection,
          inputType,
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

        disconnectLiveConnection(params.connectionId, direction, location);
        element.style.cursor = "grabbing";
        window.addEventListener("mouseup", handleMouseUp);
      }
    };

    element.addEventListener("mousedown", handleDisconnectGrab);

    return {
      destroy() {
        element.removeEventListener("mousedown", handleDisconnectGrab);
      },
    };
  }

  const inputType = ConnectionInputType.color;

  function listenLiveConnectionAction(element: HTMLElement) {
    const nearTerminalDistance = 4;

    // take action on change in the liveConnection state
    const unsubscriber = liveConnectionStore.subscribe((liveConnection) => {
      if (
        liveConnection &&
        liveConnection.inputType == inputType &&
        liveConnection.dragTerminalDirection == direction
      ) {
        const handleMouseUp = (event: MouseEvent) => {
          const rect = element.getBoundingClientRect();

          // expanding the rect
          const left = rect.left - nearTerminalDistance;
          const top = rect.top - nearTerminalDistance;
          const right = rect.right + nearTerminalDistance;
          const bottom = rect.bottom + nearTerminalDistance;

          if (
            checkPointWithinBox(
              { x: event.pageX, y: event.pageY },
              { top: top, bottom: bottom, left: left, right: right }
            )
          )
            // use the callback from the liveCable context store
            liveConnection.attach(nodeId, inputName);
          window.removeEventListener("mouseup", handleMouseUp);
        };
        // handle on mouseup near compatible terminal
        window.addEventListener("mouseup", handleMouseUp);
      }
    });

    return {
      destroy() {
        unsubscriber();
      },
    };
  }

  $: connectionIds = $nodeTerminalRectCenterStores
    ? Object.keys($nodeTerminalRectCenterStores)
    : [];

  $: expanded = near || usingNovelTerminal;

  $: terminals = [...connectionIds, "novel"].reduce<
    {
      actionDescriptions: ActionDescription<any>[];
      cabled: boolean;
    }[]
  >((result, connectionId) => {
    if (connectionId == "novel") {
      if (direction != TerminalDirection.in || connectionIds.length == 0) {
        result.push({
          actionDescriptions: [
            {
              action: handleNovelGrabAction,
              params: { connectionId: uuidv4() },
            },
            {
              action: listenLiveConnectionAction,
            },
          ],
          cabled: false,
        });
      }
    } else {
      result.push({
        actionDescriptions: [
          {
            action: terminalCenterUpdateAction,
            params: { connectionId: connectionId },
          },
          {
            action: handleDisconnectGrabAction,
            params: { connectionId: connectionId },
          },
          {
            action: listenLiveConnectionAction,
          },
        ],
        cabled: true,
      });
    }
    return result;
  }, []);

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
    {#each Object.entries(terminals) as [connectionId, terminal], i (i)}
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
    background-color: var(--tp-base-background-color);
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
    transition: width 500ms;
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
