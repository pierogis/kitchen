<script lang ts>
  import { createEventDispatcher, onMount } from "svelte";
  import TerminalRack from "./terminal-rack.svelte";
  import { TerminalDirection } from "../terminal";
  import { Pane } from "tweakpane";

  export let height: number;
  export let width: number;

  const dispatch = createEventDispatcher();

  let container: HTMLElement;

  let widthInRack: HTMLElement;
  let widthOutRack: HTMLElement;
  let heightInRack: HTMLElement;
  let heightOutRack: HTMLElement;

  function change() {
    dispatch("change", { height, width });
  }

  onMount(() => {
    let pane = new Pane({ container: container });

    const params = {
      width: width,
      height: height,
    };

    let widthInput = pane
      .addInput(params, "width", {
        step: 1,
      })
      .on("change", (ev) => {
        width = ev.value;
        change();
      });

    widthInput.controller_.view.element.appendChild(widthInRack);
    widthInput.controller_.view.element.appendChild(widthOutRack);

    let heightInput = pane
      .addInput(params, "height", {
        step: 1,
      })
      .on("change", (ev) => {
        height = ev.value;
        change();
      });

    heightInput.controller_.view.element.appendChild(heightInRack);
    heightInput.controller_.view.element.appendChild(heightOutRack);
  });
</script>

<div bind:this={container} />

<TerminalRack bind:container={widthInRack} direction={TerminalDirection.in} />
<TerminalRack bind:container={widthOutRack} direction={TerminalDirection.out} />
<TerminalRack bind:container={heightInRack} direction={TerminalDirection.in} />
<TerminalRack
  bind:container={heightOutRack}
  direction={TerminalDirection.out}
/>
