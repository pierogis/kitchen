<script lang="ts" context="module">
  export const terminalHeight = 10;
</script>

<script lang="ts">
  import { getContext } from "svelte";
  import { derived, Readable } from "svelte/store";

  import cssVars from "svelte-css-vars";

  import type {
    NodeTerminalRectsUpdateCallbacksState,
    RectUpdateCallback,
  } from "./terminals";
  import { TerminalDirection } from "./terminals";
  import Terminal from "./Terminal.svelte";
  import {
    anchorLiveConnectionKey,
    disconnectLiveConnectionKey,
    liveConnectionStore,
  } from "../connections/live-connection";
  import { checkNearAction } from "../common/actions/checkNear";
  import { checkPointWithinBox } from "../common/utils";
  import { ConnectionInputType } from "../connections/connections";
  import type { ActionDescription } from "../common/actions/useActions";

  export let direction: TerminalDirection;
  export let container: HTMLElement;

  let near: boolean = false;

  export let inputName: string;

  const nearTerminalRackDistance = 12;
  const rackHeight = 20;

  const paneOffset = 6;

  const nodeId: string = getContext("nodeId");

  // get store containing callbacks to use to broadcast bounding rect
  const nodeCallbacksStore: Readable<NodeTerminalRectsUpdateCallbacksState> =
    getContext(nodeId);

  // look specifically in nested part of this store
  const rectUpdateCallbacks: Readable<{ [key: string]: RectUpdateCallback }> =
    derived(
      nodeCallbacksStore,
      (nodeCallbacks: NodeTerminalRectsUpdateCallbacksState) => {
        return nodeCallbacks && nodeCallbacks[direction][inputName];
      },
      {}
    );

  function terminalRectCallbackAction(
    element: HTMLElement,
    params: { connectionId: string }
  ) {
    let rectUpdateCallbackInterval: NodeJS.Timer;

    let updateRect = () => {
      // don't bother if there are none to call
      if (
        $rectUpdateCallbacks &&
        Object.entries($rectUpdateCallbacks).length > 0
      ) {
        // calculate the rect and dispatch to the callback
        let rect: DOMRect = element.getBoundingClientRect();
        // accounts for scroll
        rect.x += window.pageXOffset;
        rect.y += window.pageYOffset;
        $rectUpdateCallbacks[params.connectionId](rect);
      }
    };

    rectUpdateCallbackInterval = setInterval(updateRect, 10);
    return {
      update(newParams: { connectionId: string }) {
        params = newParams;
      },
      destroy() {
        clearInterval(rectUpdateCallbackInterval);
      },
    };
  }
  let disconnectLiveConnection: (
    connectionId: string,
    direction: TerminalDirection,
    location: { x: number; y: number }
  ) => void = getContext(disconnectLiveConnectionKey);

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

  function liveCableAction(element: HTMLElement) {
    const nearTerminalDistance = 4;

    // take action on change in the liveCable state
    const unsubscriber = liveConnectionStore.subscribe((liveTerminal) => {
      if (
        liveTerminal &&
        liveTerminal.inputType == inputType &&
        liveTerminal.dragTerminalDirection == direction
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
            liveTerminal.attach(nodeId, inputName);
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

  let usingNovelTerminal = false;

  const anchorLiveConnection: (
    direction: TerminalDirection,
    location: { x: number; y: number },
    inputType: ConnectionInputType,
    nodeId: string,
    inputName: string
  ) => void = getContext(anchorLiveConnectionKey);

  // grabbing novel terminal should start relaying the coords of the terminal
  // and add event listeners for release
  function handleNovelGrabAction(element: HTMLElement) {
    const handleMouseUp = (event: MouseEvent) => {
      usingNovelTerminal = false;
      window.removeEventListener("mouseup", handleMouseUp);
      element.style.cursor = "";
    };

    const handleNovelGrab = (event: MouseEvent) => {
      if (event.button == 0) {
        anchorLiveConnection(
          direction,
          {
            x: event.x,
            y: event.y,
          },
          inputType,
          nodeId,
          inputName
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

  function handleDropInTerminalAction(element: HTMLElement) {
    let unsubscriber = liveConnectionStore.subscribe((liveConnection) => {
      if (liveConnection) {
        const handleDropInTerminal = (event: MouseEvent) => {
          liveConnection.attach(nodeId, inputName);
          element.removeEventListener("mouseup", handleDropInTerminal);
        };
        const liveTerminalDirection = liveConnection.dragTerminalDirection;
        if (
          liveTerminalDirection == direction &&
          liveConnection.inputType == inputType
        ) {
          element.addEventListener("mouseup", handleDropInTerminal);
        }
      }
    });

    return {
      destroy() {
        unsubscriber();
      },
    };
  }

  $: connectionIds = $rectUpdateCallbacks
    ? Object.keys($rectUpdateCallbacks)
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
            },
            {
              action: handleDropInTerminalAction,
            },
          ],
          cabled: false,
        });
      }
    } else {
      result.push({
        actionDescriptions: [
          {
            action: terminalRectCallbackAction,
            params: { connectionId: connectionId },
          },
          {
            action: handleDisconnectGrabAction,
            params: { connectionId: connectionId },
          },
          {
            action: liveCableAction,
          },
          {
            action: handleDropInTerminalAction,
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
