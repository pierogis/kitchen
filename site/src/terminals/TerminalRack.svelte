<script lang="typescript">
  import { getContext, onMount } from "svelte";
  import { derived, Readable, Writable } from "svelte/store";

  import cssVars from "svelte-css-vars";

  import type {
    NodeRectUpdateCallbacksState,
    RectUpdateCallback,
    TerminalDirection,
  } from "./terminals";
  import Terminal from "./Terminal.svelte";

  export let direction: TerminalDirection;
  export let container: HTMLElement;

  let expanded: boolean;
  let expandedLocked: boolean = false;

  export let inputName: string;

  const nearTerminalRackDistance = 12;
  const terminalWidth = 10;
  const terminalGap = 4;

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
  let nodeCallbacksStore: Writable<NodeRectUpdateCallbacksState> =
    getContext(callbacksKey);

  // look specifically in nested part of this store
  let rectUpdateCallbacks: Readable<{ [key: string]: RectUpdateCallback }> =
    derived(nodeCallbacksStore, ($nodeCallbacks) => {
      return $nodeCallbacks[direction][inputName];
    });

  // repeatedly broadcast terminal rects
  setInterval(() => {
    // don't bother if there are none to call
    if (
      $rectUpdateCallbacks &&
      Object.entries($rectUpdateCallbacks).length > 0
    ) {
      // calculate the rect and dispatc to all the callbacks
      Object.entries($rectUpdateCallbacks).forEach(
        ([connectionId, callback]: [string, RectUpdateCallback], i: number) => {
          callback(terminalContainers[i].getBoundingClientRect());
        }
      );
    }
  }, 10);

  // 1 more terminal than there are connections
  $: terminals =
    1 +
    ($rectUpdateCallbacks ? Object.entries($rectUpdateCallbacks).length : 0);
  let terminalContainers: { [key: number]: HTMLElement } = {};

  // if expanded, take a width dependent on the number of terminals
  $: width = !expanded
    ? 4
    : terminalGap * (terminals + 1) + terminalWidth * terminals;

  $: styleVars = {
    width: width + "px",
    paneOffset: paneOffset + "px",
    terminalGap: terminalGap + "px",
  };
</script>

<svelte:window on:mousemove={checkNear} />

<div
  bind:this={container}
  class="terminal-rack {direction}"
  class:expanded
  use:cssVars={styleVars}
>
  {#each [...Array(terminals).keys()] as i (i)}
    <Terminal bind:container={terminalContainers[i]} {direction} {expanded} />
  {/each}
</div>

<style>
  .terminal-rack {
    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 6px 6px 6px 6px;
    background-color: var(--tp-base-background-color);
    box-shadow: 0 2px 4px var(--tp-base-shadow-color);

    position: relative;
    width: var(--width);
    height: 20px;
    z-index: -3;
    transition: all 300ms;
  }

  .in {
    right: calc(var(--width) + var(--paneOffset));
    margin-right: calc(0px - var(--width));
  }

  .out {
    left: calc(var(--width) + var(--paneOffset));
    margin-left: calc(0px - var(--width));
  }

  .expanded {
    gap: var(--terminalGap);
  }
</style>
