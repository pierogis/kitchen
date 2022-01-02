<script lang="ts">
  import { Writable, writable } from "svelte/store";
  import Cable from "../cable/Cable.svelte";
  import { calculateCenter } from "../common/utils";
  import Terminal from "../terminals/Terminal.svelte";
  import { terminalHeight } from "../terminals/TerminalRack.svelte";
  import { TerminalDirection } from "../terminals/terminals";
  import { liveConnectionStore } from "./live-connection";

  export let mouseX: number;
  export let mouseY: number;

  // store a single set of coords for when a cable is being dragged
  const inCoords: Writable<{
    x: number;
    y: number;
  }> = writable(null);
  const outCoords: Writable<{
    x: number;
    y: number;
  }> = writable(null);

  const updateLiveInCoords = (rect: DOMRect) => {
    let center = calculateCenter(rect);
    inCoords.set({
      x: center.x,
      y: center.y,
    });
  };

  const updateLiveOutCoords = (rect: DOMRect) => {
    let center = calculateCenter(rect);
    outCoords.set({
      x: center.x,
      y: center.y,
    });
  };

  function dragTerminalAction(
    element: HTMLElement,
    params: { direction: TerminalDirection }
  ) {
    let dragTerminalTimer: NodeJS.Timer;

    element.style.top = mouseY + "px";
    element.style.left = mouseX + "px";

    const moveTerminal = (event: MouseEvent) => {
      event.preventDefault();
      element.style.top = event.y + "px";
      element.style.left = event.x + "px";
    };
    window.addEventListener("mousemove", moveTerminal);

    dragTerminalTimer = setInterval(() => {
      const rect = element.getBoundingClientRect();
      if (params.direction == TerminalDirection.in) {
        updateLiveInCoords(rect);
      } else if (params.direction == TerminalDirection.out) {
        updateLiveOutCoords(rect);
      }
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
        $inCoords = null;
        $outCoords = null;
      },
    };
  }
</script>

{#if $liveConnectionStore}
  {#if $inCoords && $outCoords}
    <!-- {#if $liveCoordsStore} -->
    <Cable {inCoords} {outCoords} />
  {/if}
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
