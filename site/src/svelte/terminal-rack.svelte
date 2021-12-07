<script lang=ts>
  import Terminal from "./terminal.svelte";
  import type { TerminalDirection } from "../terminal";

  import cssVars from "svelte-css-vars";

  export let direction: TerminalDirection;
  export let container: HTMLElement;
  let expanded: boolean;
  let expandedLocked: boolean = false;

  // import { Writable, writable } from "svelte/store";

  // let terminals: Writable<TerminalModel[]> = writable([
  //     {
  //         expanded: false,
  //         selected: false,
  //     },
  // ]);

  let terminals = 1;

  const nearTerminalRackDistance = 8;
  const terminalWidth = 10;
  const terminalGap = 4;

  let width = 4;
  $: expandedWidth = terminalGap * (terminals + 1) + terminalWidth * terminals;
  $: expandedDirection = expandedWidth + terminalWidth - terminalGap;

  $: styleVars = {
    width: width + "px",
    expandedWidth: expandedWidth + "px",
    expandedDirection: expandedDirection + "px",
    terminalWidth: terminalWidth + "px",
    terminalGap: terminalGap + "px",
  };

  function checkNear(event) {
    if (!expandedLocked) {
      let rackRect = container.getBoundingClientRect();
      var left = rackRect.left - nearTerminalRackDistance;
      var top = rackRect.top - nearTerminalRackDistance;
      var right = rackRect.right + nearTerminalRackDistance;
      var bottom = rackRect.bottom + nearTerminalRackDistance;
      var x = event.pageX;
      var y = event.pageY;
      if (x > left && x < right && y > top && y < bottom) {
        expanded = true;
      } else {
        expanded = false;
      }
    }
  }
</script>

<svelte:window on:mousemove={checkNear} />

<div
  bind:this={container}
  class="terminal-rack {direction}"
  class:expanded
  use:cssVars={styleVars}
>
  {#each Array(terminals) as terminal}
    <Terminal {direction} {expanded} />
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
    right: 10px;
    margin-right: -4px;
  }

  .out {
    left: 10px;
    margin-left: -4px;
  }

  .expanded {
    gap: var(--terminal-gap);
  }

  .terminal-rack.expanded.in {
    width: var(--expandedWidth);
    margin-right: calc(0px - var(--expandedWidth));
    /* right: calc(var(--width) + var(--terminalWidth) - var(--terminalGap)); */
    right: var(--expandedDirection);
  }

  .terminal-rack.expanded.out {
    width: var(--width);
    margin-left: calc(0px - var(--width));
    left: calc(var(--width) + var(--terminalWidth) - var(--terminalGap));
  }
</style>
