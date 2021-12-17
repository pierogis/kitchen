<script lang="typescript">
  import { createEventDispatcher, onMount, tick } from "svelte";

  import { InputBindingApi, Pane, TpChangeEvent } from "tweakpane";
  import type { IngredientControlHandle } from "../ingredients/ingredients";

  export let type: string;
  export let options: { [key: string]: string };
  export let attach: (pane) => Promise<IngredientControlHandle>;

  let inputs: IngredientControlHandle = {};

  let pane: Pane;

  const dispatch = createEventDispatcher();

  let typeInput: InputBindingApi<unknown, string>;

  // remove tweakpane inputs from pane
  // replace with new type's
  async function updateType(event: TpChangeEvent<string>) {
    dispatch("updateType", event.value);
    for (let [inputName, input] of Object.entries(inputs)) {
      input.dispose();
    }
    await tick();
    // attach should update
    inputs = await attach(pane);
  }

  function attachPane(element: HTMLElement) {
    pane = new Pane({ container: element });

    typeInput = pane
      .addInput({ type: type }, "type", {
        options: options,
        index: 0,
      })
      .on("change", updateType);
  }

  onMount(async () => {
    inputs = await attach(pane);
  });
</script>

<div use:attachPane />

<!-- {#each racks.in as inputName (inputName)}
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
{/each} -->
