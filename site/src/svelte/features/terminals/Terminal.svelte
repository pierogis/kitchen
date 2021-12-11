<script lang="typescript">
  import type { TerminalDirection } from "./terminal";

  export let direction: TerminalDirection;
  export let expanded: boolean;
  let selected = false;

  function select(event) {
    selected = true;
  }
</script>

<div
  class="terminal {direction}"
  class:expanded
  class:selected
  on:mouseover={select}
/>

<style>
  .terminal {
    border: 0px outset hsla(0, 0%, 20%, 0.3);
    background-color: var(--tp-button-background-color-hover);
    position: relative;
    width: 4px;
    height: 10px;
    transition: all 300ms, border 300ms;
    z-index: -1;
  }

  .selected {
    border: 2px inset hsla(0, 0%, 20%, 0.5);

    cursor: grab;
  }

  .in {
    border-radius: 50% 10% 10% 50%;
    right: 4px;
  }

  .out {
    border-radius: 10% 50% 50% 10%;
    left: 4px;
  }

  .expanded {
    width: 10px;
    border-radius: 50% 50% 50% 50%;
  }

  .terminal.expanded.in {
    margin-right: -8px;
  }

  .terminal.expanded.out {
    margin-left: -8px;
  }
</style>
