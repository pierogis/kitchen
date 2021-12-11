<script lang="typescript">
  import { createEventDispatcher, onMount } from "svelte";
  import TerminalRack from "./TerminalRack.svelte";
  import { TerminalDirection } from "../terminal";
  import { Pane } from "tweakpane";

  const dispatch = createEventDispatcher();

  function change() {
    dispatch("change", {});
  }

  let container: HTMLElement;
  export let r: number = 120;
  export let g: number = 150;
  export let b: number = 190;
  export let racks: {
    colorIn: boolean;
    colorOut: boolean;
  };

  let colorInRack: HTMLElement;
  let colorOutRack: HTMLElement;

  onMount(() => {
    let pane = new Pane({
      container: container,
    });
    let colorInput = pane
      .addInput({ color: { r: r, g: g, b: b } }, "color")
      .on("change", (ev) => {
        r = ev.value.r;
        g = ev.value.g;
        b = ev.value.b;
      });

    colorInput.controller_.view.element.prepend(colorInRack);
    colorInput.controller_.view.element.append(colorOutRack);
  });
</script>

<div bind:this={container} />

{#if racks.colorIn}
  <TerminalRack bind:container={colorInRack} direction={TerminalDirection.in} />
{/if}
{#if racks.colorOut}
  <TerminalRack
    bind:container={colorOutRack}
    direction={TerminalDirection.out}
  />
{/if}
