<script lang="typescript" context="module">
  export const terminalHeight = 10;
</script>

<script lang="typescript">
  import { getContext } from "svelte";
  import { derived, Readable, Writable } from "svelte/store";

  import cssVars from "svelte-css-vars";

  import type {
    NodeTerminalRectsUpdateCallbacksState,
    RectUpdateCallback,
  } from "./terminals";
  import type { TerminalDirection } from "./terminals";
  import Terminal from "./Terminal.svelte";
  import {
    anchorLiveConnectionKey,
    detachLiveConnectionKey,
  } from "../connections/live-connection";
  import { checkNearAction } from "../common/actions/checkNear";

  export let direction: TerminalDirection;
  export let container: HTMLElement;

  let near: boolean = false;

  export let inputName: string;

  const nearTerminalRackDistance = 12;
  const rackHeight = 20;

  let paneOffset = 6;

  let nodeId = getContext("nodeId");

  const callbacksKey = nodeId;

  // get store containing callbacks to use to broadcast bounding rect
  let nodeCallbacksStore: Writable<NodeTerminalRectsUpdateCallbacksState> =
    getContext(callbacksKey);

  // look specifically in nested part of this store
  let rectUpdateCallbacks: Readable<{ [key: string]: RectUpdateCallback }> =
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

  let detachLiveConnection: (
    connectionId: string,
    direction: TerminalDirection
  ) => void = getContext(detachLiveConnectionKey);

  function handleDisconnectGrab(connectionId: string) {
    detachLiveConnection(connectionId, direction);
  }

  let usingNovelTerminal = false;

  // grabbing novel terminal should start relaying the coords of the terminal
  // and add event listeners for release
  function handleNovelGrabAction(element: HTMLElement) {
    let novelGrabUpdateCallbackInterval: NodeJS.Timer;

    let anchorLiveConnection: (
      direction: TerminalDirection,
      location: { x: number; y: number }
    ) => (rect: DOMRect) => void = getContext(anchorLiveConnectionKey);

    let handleMouseUp = () => {
      clearInterval(novelGrabUpdateCallbackInterval);
      usingNovelTerminal = false;
      window.removeEventListener("mouseup", handleMouseUp);
    };

    let handleNovelGrab = (event: MouseEvent) => {
      let updateLiveCoords = anchorLiveConnection(direction, {
        x: event.x,
        y: event.y,
      });
      usingNovelTerminal = true;
      novelGrabUpdateCallbackInterval = setInterval(() => {
        let rect = element.getBoundingClientRect();
        updateLiveCoords(rect);
      }, 10);
      window.addEventListener("mouseup", handleMouseUp);
    };

    element.addEventListener("mousedown", handleNovelGrab);

    return {
      destroy() {
        element.removeEventListener("mousedown", handleNovelGrab);
        window.removeEventListener("mouseup", handleMouseUp);
      },
    };
  }

  $: connectionIds = $rectUpdateCallbacks
    ? Object.keys($rectUpdateCallbacks)
    : [];

  $: expanded = near || usingNovelTerminal;

  // if expanded, take a width dependent on the number of terminals
  // 1 more terminal than there are connections
  $: rackWidth = !expanded
    ? 4
    : ((rackHeight - terminalHeight) / 2) * (connectionIds.length + 2) +
      terminalHeight * (connectionIds.length + 1);

  $: styleVars = {
    rackWidth: rackWidth + "px",
    rackHeight: rackHeight + "px",
    paneOffset: paneOffset + "px",
  };
</script>

<div
  bind:this={container}
  class="terminal-rack {direction}"
  class:expanded
  use:cssVars={styleVars}
  use:checkNearAction={nearTerminalRackDistance}
  on:near={(event) => {
    near = event.detail;
  }}
>
  {#each connectionIds as connectionId (connectionId)}
    <Terminal
      actionDescriptions={[
        {
          action: terminalRectCallbackAction,
          params: { connectionId: connectionId },
        },
      ]}
      cabled={true}
      {direction}
      {expanded}
      {terminalHeight}
    />
  {/each}
  <Terminal
    actionDescriptions={[
      {
        action: handleNovelGrabAction,
      },
    ]}
    cabled={usingNovelTerminal}
    {direction}
    {expanded}
    {terminalHeight}
  />
</div>

<style>
  .terminal-rack {
    display: flex;
    align-items: center;
    justify-content: space-evenly;

    border-radius: 6px 6px 6px 6px;
    background-color: var(--tp-base-background-color);
    box-shadow: 0 2px 4px var(--tp-base-shadow-color);

    position: relative;
    width: var(--rackWidth);
    height: var(--rackHeight);
    transition: all 300ms;
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
