<script lang="typescript">
  import { v4 as uuidv4 } from "uuid";

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

  let rackId = uuidv4();

  let expanded: boolean;
  let expandedLocked: boolean = false;

  // export let connections = [];
  export let inputName: string;

  const nearTerminalRackDistance = 8;
  const terminalWidth = 10;
  const terminalGap = 4;

  let paneOffset = 6;

  function checkNear(event: MouseEvent) {
    if (!expandedLocked) {
      let rackRect = container.getBoundingClientRect();

      let left = rackRect.left - nearTerminalRackDistance;
      let top = rackRect.top - nearTerminalRackDistance;
      let right = rackRect.right + nearTerminalRackDistance;
      let bottom = rackRect.bottom + nearTerminalRackDistance;

      let x = event.pageX;
      let y = event.pageY;

      if (x > left && x < right && y > top && y < bottom) {
        expanded = true;
      } else {
        expanded = false;
      }
    }
  }

  let nodeId = getContext("nodeId");

  const callbacksKey = nodeId;

  let nodeCallbacksStore: Writable<NodeRectUpdateCallbacksState> =
    getContext(callbacksKey);

  let rectUpdateCallbacks: Readable<{ [key: string]: RectUpdateCallback }> =
    derived(nodeCallbacksStore, ($nodeCallbacks) => {
      return $nodeCallbacks[direction][inputName];
    });

  onMount(() => {
    // console.log($nodeCallbacksStore);
    // context set with node, input, dir before terminal racks mount
    setInterval(() => {
      $rectUpdateCallbacks &&
        Object.entries($rectUpdateCallbacks).forEach(
          (
            [connectionId, callback]: [string, RectUpdateCallback],
            i: number
          ) => {
            callback(terminalContainers[i].getBoundingClientRect());
          }
        );
    }, 10);
  });

  $: terminals =
    1 +
    ($rectUpdateCallbacks ? Object.entries($rectUpdateCallbacks).length : 0);
  let terminalContainers: { [key: string]: HTMLElement } = {};

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
