<script lang="ts">
  import { createEventDispatcher, onMount, tick } from "svelte";

  import { InputBindingApi, Pane, TpChangeEvent } from "tweakpane";

  import { ActionDescription, useActions } from "../common/actions/useActions";
  import type { IngredientControlHandle } from "../ingredients/ingredients";

  export let type: string;
  export let typeOptions: { [key: string]: string };
  export let attach: (pane) => IngredientControlHandle;

  export let actionDescriptions: ActionDescription<any>[];

  let parameters: IngredientControlHandle = {};

  let pane: Pane;

  const dispatch = createEventDispatcher();

  let typeInput: InputBindingApi<unknown, string>;

  // remove tweakpane parameters from pane
  // replace with new type's
  async function updateType(event: TpChangeEvent<string>) {
    dispatch("updateType", event.value);
    for (let [parameterName, parameter] of Object.entries(parameters)) {
      parameter.dispose();
    }
    await tick();
    // attach should update
    parameters = attach(pane);
  }

  function attachPaneAction(element: HTMLElement) {
    pane = new Pane({ container: element });

    typeInput = pane
      .addInput({ type: type }, "type", {
        options: typeOptions,
        index: 0,
      })
      .on("change", updateType);

    typeInput.controller_.valueController.view.element.parentElement.style.width =
      "100px";
  }

  onMount(() => {
    parameters = attach(pane);
  });
</script>

<div use:attachPaneAction use:useActions={actionDescriptions} />
