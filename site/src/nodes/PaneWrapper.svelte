<script lang="typescript">
  import { createEventDispatcher, onMount, tick } from "svelte";

  import { InputBindingApi, Pane, TpChangeEvent } from "tweakpane";

  export let type: string;
  export let options: { [key: string]: string };
  export let attach: (pane) => void;

  let inputs: {
    [key: string]: InputBindingApi<unknown, string>;
  } = {};

  let pane: Pane;

  const dispatch = createEventDispatcher();

  // function updatePane() {
  //   // divs that TerminalRacks bind to
  //   ;
  //   // dispatch("inputs", inputs);
  // }

  onMount(() => {
    attach(pane);
  });

  async function updateType(event: TpChangeEvent<string>) {
    dispatch("updateType", event.value);
    for (let [inputName, input] of Object.entries(inputs)) {
      input.dispose();
    }
    await tick();
    attach(pane);
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
