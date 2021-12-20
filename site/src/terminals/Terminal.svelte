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

    transition: all 300ms, border 300ms;
    z-index: 1;
    cursor: grab;
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
    /* border: 2px inset hsla(0, 0%, 20%, 0.5); */
    border: var(--border-width) inset var(--cable-color-number);
    background-color: var(--tp-button-background-color-hover);
    width: 4px;

    margin: -2px;
    z-index: 2;
  }

  .cabled.in {
    border-radius: 50% 10% 10% 50%;
    right: 4px;
  }

  .cabled.out {
    border-radius: 10% 50% 50% 10%;
    left: 4px;
  }

  .expanded {
    width: var(--terminalHeight);
  }

  .expanded.in {
    right: 0px;
    border-radius: 50% 50% 50% 50%;
  }

  .expanded.out {
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
