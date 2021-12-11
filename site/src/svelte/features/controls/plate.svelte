<script lang="typescript">
  import { createEventDispatcher, onMount } from "svelte";
  import { Pane } from "tweakpane";

  import { TerminalDirection } from "../terminals/terminal";
  import TerminalRack from "../terminals/terminal-rack.svelte";
  import Terminal from "../../Terminal.svelte";

  export let height: number;
  export let width: number;
  export let racks: {
    widthIn: boolean;
    widthOut: boolean;
    heightIn: boolean;
    heightOut: boolean;
  };
  export let attachCallback;

  let container: HTMLElement;

  let widthInRack: HTMLElement;
  let widthOutRack: HTMLElement;
  let heightInRack: HTMLElement;
  let heightOutRack: HTMLElement;

  const dispatch = createEventDispatcher();

  function change() {
    dispatch("change", { height, width });
  }

  onMount(() => {
    const params = {
      width: width,
      height: height,
    };

    let pane = new Pane({
      container: container,
    });

    let widthInput = pane
      .addInput(params, "width", {
        step: 1,
      })
      .on("change", (ev) => {
        width = ev.value;
        change();
      });

    widthInput.controller_.view.element.prepend(widthInRack);
    widthInput.controller_.view.element.append(widthOutRack);

    let heightInput = pane
      .addInput(params, "height", {
        step: 1,
      })
      .on("change", (ev) => {
        height = ev.value;
        change();
      });

    heightInput.controller_.view.element.prepend(heightInRack);
    heightInput.controller_.view.element.append(heightOutRack);
  });
</script>

<div bind:this={container} />

{#if racks.widthIn}
  <TerminalRack bind:container={widthInRack} direction={TerminalDirection.in} />
{/if}
{#if racks.widthIn}
  <TerminalRack
    bind:container={widthOutRack}
    direction={TerminalDirection.out}
  />
{/if}
{#if racks.widthIn}
  <TerminalRack
    bind:container={heightInRack}
    direction={TerminalDirection.in}
  />
{/if}
{#if racks.widthIn}
  <TerminalRack
    bind:container={heightOutRack}
    direction={TerminalDirection.out}
  />
{/if}
