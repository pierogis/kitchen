<script lang="ts">
  import { calculateCenter } from "../common/utils";
  import { liveConnectionStore } from "./live-connection";
  import { terminalHeight } from "../terminals/TerminalRack.svelte";

  import Cable from "../cable/Cable.svelte";
  import Terminal from "../terminals/Terminal.svelte";
  import type { TerminalDirection } from "../terminals/terminals";

  // access to a store of the coords for when a cable is being dragged
  $: dragCoordsStore =
    $liveConnectionStore && $liveConnectionStore.dragCoordsStore;

  function dragTerminalAction(
    element: HTMLElement,
    params: { direction: TerminalDirection }
  ) {
    let dragTerminalTimer: NodeJS.Timer;

    element.style.top = $dragCoordsStore.x + "px";
    element.style.left = $dragCoordsStore.y + "px";

    const moveTerminal = (event: MouseEvent) => {
      event.preventDefault();
      element.style.top = event.y + "px";
      element.style.left = event.x + "px";
    };
    window.addEventListener("mousemove", moveTerminal);

    dragTerminalTimer = setInterval(() => {
      const rect = element.getBoundingClientRect();
      const center = calculateCenter(rect);
      dragCoordsStore.set({
        x: center.x,
        y: center.y,
      });
    }, 10);

    // update restaurant that cable has been dropped
    const dropCable = () => {
      liveConnectionStore.set(null);
      window.removeEventListener("mouseup", dropCable);
    };
    window.addEventListener("mouseup", dropCable);

    return {
      update(newParams: { direction: TerminalDirection }) {
        params = newParams;
      },
      destroy() {
        window.removeEventListener("mousemove", moveTerminal);
        window.removeEventListener("mouseup", dropCable);
        clearInterval(dragTerminalTimer);
      },
    };
  }

  console.log($liveConnectionStore);
</script>

{#if $liveConnectionStore}
  <Cable
    inCoords={$liveConnectionStore.dragCoordsStore}
    outCoords={$liveConnectionStore.anchorCoordsStore}
  />
  <Terminal
    actionDescriptions={[
      {
        action: dragTerminalAction,
        params: { direction: $liveConnectionStore.dragTerminalDirection },
      },
    ]}
    direction={$liveConnectionStore.dragTerminalDirection}
    expanded={true}
    cabled={true}
    live={true}
    {terminalHeight}
  />
{/if}
