<script lang="typescript">
  import cssVars from "svelte-css-vars";

  import { ActionDescription, useActions } from "../common/actions/useActions";

  import type { TerminalDirection } from "./terminals";

  export let direction: TerminalDirection;
  export let expanded: boolean;
  export let terminalHeight: number;
  export let cabled: boolean;
  export let live = false;

  export let actionDescriptions: ActionDescription<any>[];

  $: styleVars = {
    terminalHeight: terminalHeight + "px",
  };
</script>

<div
  use:useActions={actionDescriptions}
  class="terminal {direction}"
  class:expanded
  class:cabled
  class:live
  use:cssVars={styleVars}
/>

<style>
  .terminal {
    --border-width: 2px;
    position: relative;
    width: 0px;
    height: var(--terminalHeight);

    border: 0px inset var(--cable-color-number);
    background-color: hsla(0, 0%, 40%, 1);

    transition: border-radius 300ms, border 300ms, margin 300ms, width 300ms,
      left 300ms, right 300ms;
    z-index: 1;
    cursor: grab;

    pointer-events: all;
  }

  .terminal:focus {
    border: var(--border-width) inset var(--cable-color-number);
    width: 2px;

    margin: -2px;
    z-index: 2;

    /* outline-color: transparent;
    outline-style: none; */
  }

  .in {
    border-radius: 10% 50% 50% 10%;
    right: 2px;
  }

  .out {
    border-radius: 50% 10% 10% 50%;
    left: 2px;
  }

  .cabled {
    border: var(--border-width) inset var(--cable-color-number);
    background-color: var(--tp-button-background-color-hover);
    width: 2px;

    margin: -2px;
    z-index: 2;
  }

  .cabled.in,
  .terminal.in:focus {
    border-radius: 50% 10% 10% 50%;
    right: 4px;
  }

  .cabled.out,
  .terminal.out:focus {
    border-radius: 10% 50% 50% 10%;
    left: 4px;
  }

  .expanded,
  .terminal.expanded:focus {
    width: var(--terminalHeight);
  }

  .expanded.in,
  .terminal.expanded.in:focus {
    right: 0px;
    border-radius: 50% 50% 50% 50%;
  }

  .expanded.out,
  .terminal.expanded.out:focus {
    left: 0px;
    border-radius: 50% 50% 50% 50%;
  }

  .live {
    position: absolute;
    transition: all 0s;
    margin: calc(-1 * (var(--terminalHeight) / 2 + var(--border-width)));
    z-index: 2;

    cursor: grabbing;
  }
</style>
