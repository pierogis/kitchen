<script lang="typescript">
  import { createEventDispatcher } from "svelte";

  import cssVars from "svelte-css-vars";

  import Terminal from "./Terminal.svelte";
  import type { TerminalDirection } from "./terminals";

  export let direction: TerminalDirection;
  export let container: HTMLElement;

  let expanded: boolean;
  let expandedLocked: boolean = false;

  let connections = [];

  let terminals = 1 + connections.length;

  const nearTerminalRackDistance = 8;
  const terminalWidth = 10;
  const terminalGap = 4;

  let paneOffset = 6;
  $: width = !expanded
    ? 4
    : terminalGap * (terminals + 1) + terminalWidth * terminals;

  $: styleVars = {
    width: width + "px",
    paneOffset: paneOffset + "px",
    terminalGap: terminalGap + "px",
  };

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

  let dispatch = createEventDispatcher();

  function dispatchUpdateTerminalRect(rect: DOMRect, i: number) {
    dispatch("terminalRect", {
      rect: rect,
      id: i,
      direction: direction,
    });
  }
</script>

<svelte:window on:mousemove={checkNear} />

<div
  bind:this={container}
  class="terminal-rack {direction}"
  class:expanded
  use:cssVars={styleVars}
>
  {#each Array(terminals) as terminal, i}
    <Terminal
      {direction}
      {expanded}
      on:terminalRect={(event) =>
        dispatchUpdateTerminalRect(event.detail, i)}
    />
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
