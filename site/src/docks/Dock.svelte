<script lang="ts">
  import { checkNearAction } from "../common/actions/checkNear";
  import { checkPointWithinBox } from "../common/utils";
  import { droppedNodeCoordsStore, nodesStore } from "../nodes/nodes";
  import { TerminalDirection } from "../terminals/terminals";

  export let direction: TerminalDirection;
  let expanded = false;

  function dropInAction(element: HTMLElement) {
    const rect = element.getBoundingClientRect();

    droppedNodeCoordsStore.subscribe(({ dockedStatusStore, coords }) => {
      const within = checkPointWithinBox(coords, rect);
      if (within) {
        dockedStatusStore.set({ docked: true, direction });
      }
    });
  }
</script>

<div
  class="dock"
  class:expanded
  class:in={direction == TerminalDirection.in}
  class:out={direction == TerminalDirection.out}
  use:checkNearAction={10}
  use:dropInAction
  on:near={(event) => {
    expanded = event.detail;
  }}
>
  <slot />
</div>

<style>
  .dock {
    position: absolute;
    right: 0%;
    top: 50%;

    transform: translate(0%, -50%);

    height: 90vh;
    width: 10px;

    background-color: var(--primary-color);
    border-radius: 4px;

    transition: width 0.2s;
  }
  .expanded {
    width: 40px;
  }
  .in {
    left: 0%;
  }
  .out {
    right: 0%;
  }
</style>
