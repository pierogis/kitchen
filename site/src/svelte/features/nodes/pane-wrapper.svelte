<script lang="typescript">
  import { afterUpdate, createEventDispatcher } from "svelte";

  import { InputBindingApi, Pane, TpChangeEvent } from "tweakpane";
  import type { IngredientControlHandle } from "../ingredients/ingredients";

  import { TerminalDirection } from "../terminals/terminal";

  import TerminalRack from "../terminals/terminal-rack.svelte";

  export let type: string;
  export let options: { [key: string]: string };
  export let attach: (pane) => IngredientControlHandle;

  // lists of inputs names keyed by direction set in node state
  export let racks: {
    in: string[];
    out: string[];
  };

  let terminalRackContainers: {
    in: { [key: string]: HTMLElement };
    out: { [key: string]: HTMLElement };
  } = { in: {}, out: {} };

  let inputs: {
    [key: string]: InputBindingApi<unknown, string>;
  } = {};

  let pane: Pane;

  const dispatch = createEventDispatcher();

  afterUpdate(() => {
    // divs that TerminalRacks bind to
    inputs = attach(pane);

    // attaching bound divs to terminal racks
    racks.in.forEach((inputName) => {
      inputs[inputName].controller_.view.element.prepend(
        terminalRackContainers.in[inputName]
      );
    });

    racks.out.forEach((inputName) => {
      inputs[inputName].controller_.view.element.append(
        terminalRackContainers.out[inputName]
      );
    });
  });

  function updateType(event: TpChangeEvent<string>) {
    dispatch("updateType", event.value);
    for (let [inputName, input] of Object.entries(inputs)) {
      input.dispose();
    }
  }

  let typeInput: InputBindingApi<unknown, string>;

  // let container: HTMLElement;
  function attachPane(element: HTMLElement) {
    pane = new Pane({ container: element });

    typeInput = pane
      .addInput({ type: type }, "type", {
        options: options,
        index: 0,
      })
      .on("change", updateType);
  }
</script>

<div use:attachPane />

{#each racks.in as inputName (inputName)}
  <TerminalRack
    bind:container={terminalRackContainers.in[inputName]}
    direction={TerminalDirection.in}
  />
{/each}

{#each racks.out as inputName (inputName)}
  <TerminalRack
    bind:container={terminalRackContainers.out[inputName]}
    direction={TerminalDirection.out}
  />
{/each}
