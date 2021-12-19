<script lang="typescript" context="module">
  export const terminalHeight = 10;
</script>

<script lang="typescript">
  import { getContext, onDestroy, onMount } from "svelte";
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

  export let direction: TerminalDirection;
  export let container: HTMLElement;

  let expanded: boolean;
  let expandedLocked: boolean = false;

  export let inputName: string;

  const nearTerminalRackDistance = 12;
  const rackHeight = 20;

  let paneOffset = 6;

  /**
   * check if a mouse event was close to terminal rack
   * @param event
   */
  function checkNear(event: MouseEvent) {
    // sometimes shouldn't change state
    if (!expandedLocked) {
      let rackRect = container.getBoundingClientRect();

      // expanding the rect
      let left = rackRect.left - nearTerminalRackDistance;
      let top = rackRect.top - nearTerminalRackDistance;
      let right = rackRect.right + nearTerminalRackDistance;
      let bottom = rackRect.bottom + nearTerminalRackDistance;

      // get mouse location
      let x = event.pageX;
      let y = event.pageY;

      // if x within width and y within height, mouse is over
      if (x > left && x < right && y > top && y < bottom) {
        expanded = true;
      } else {
        expanded = false;
      }
    }
  }

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

  function terminalContainer(
    element: HTMLElement,
    params: { connectionId: string }
  ) {
    const container = element;

    let rectUpdateCallbackInterval: NodeJS.Timer;

    rectUpdateCallbackInterval = setInterval(() => {
      // don't bother if there are none to call
      if (
        $rectUpdateCallbacks &&
        Object.entries($rectUpdateCallbacks).length > 0
      ) {
        // calculate the rect and dispatch to the callback
        let rect: DOMRect = container.getBoundingClientRect();
        // accounts for scroll
        rect.x += window.pageXOffset;
        rect.y += window.pageYOffset;
        $rectUpdateCallbacks[params.connectionId](rect);
      }
    }, 10);
    return {
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

  // on mouse up, check if you are holding a terminal now in store
  // so you should be able to set that here too

  // need to cancel this interval on mouse up
  let novelGrabUpdateCallbackInterval: NodeJS.Timer;

  let anchorLiveConnection: (
    direction: TerminalDirection,
    location: { x: number; y: number }
  ) => (rect: DOMRect) => void = getContext(anchorLiveConnectionKey);

  let usingNovelTerminal = false;

  function handleNovelGrab(event: CustomEvent<{ x: number; y: number }>) {
    let updateLiveCoords = anchorLiveConnection(direction, {
      x: event.detail.x,
      y: event.detail.y,
    });
    usingNovelTerminal = true;
    novelGrabUpdateCallbackInterval = setInterval(() => {
      let rect = emptyTerminalContainer.getBoundingClientRect();
      updateLiveCoords(rect);
    }, 10);
  }

  function handleMouseUp() {
    if (novelGrabUpdateCallbackInterval !== undefined) {
      clearInterval(novelGrabUpdateCallbackInterval);
      usingNovelTerminal = false;
    }
  }

  onDestroy(() => {
    clearInterval(novelGrabUpdateCallbackInterval);
  });

  let emptyTerminalContainer: HTMLElement;

  $: connectionIds = $rectUpdateCallbacks
    ? Object.keys($rectUpdateCallbacks)
    : [];

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

<svelte:window on:mousemove={checkNear} on:mouseup={handleMouseUp} />

<div
  bind:this={container}
  class="terminal-rack {direction}"
  class:expanded
  use:cssVars={styleVars}
>
  {#each connectionIds as connectionId (connectionId)}
    <Terminal
      actionDescription={{
        action: terminalContainer,
        params: { connectionId: connectionId },
      }}
      cabled={true}
      {direction}
      {expanded}
      {terminalHeight}
      on:grab={() => handleDisconnectGrab(connectionId)}
    />
  {/each}
  <Terminal
    bind:container={emptyTerminalContainer}
    cabled={usingNovelTerminal}
    {direction}
    {expanded}
    {terminalHeight}
    on:grab={handleNovelGrab}
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
