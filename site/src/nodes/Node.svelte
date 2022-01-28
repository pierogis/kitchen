<script lang="typescript">
  import { setContext } from "svelte";
  import { derived, get, Readable } from "svelte/store";

  import cssVars from "svelte-css-vars";

  import type { Pane } from "tweakpane";

  import {
    IngredientControl,
    IngredientControlHandle,
    ingredientsStore,
  } from "../ingredients/ingredients";
  import TerminalRack from "../terminals/TerminalRack.svelte";
  import { TerminalDirection } from "../terminals/terminals";
  import { removeNode, nodesStore, NodeState, updateNode } from "./nodes";

  import PaneWrapper from "./PaneWrapper.svelte";
  import { draggableAction } from "../common/actions/draggableAction";

  export let draggable: boolean;
  export let nodeId: string;

  setContext("nodeId", nodeId);
  let dragging = false;

  // subscribe to just this node in the nodesStore
  const nodeStore: Readable<NodeState> = derived(
    nodesStore,
    ($nodes) => $nodes[nodeId]
  );

  // use these IngredientControl classes to do non svelte display stuff
  // subscribe the type specified on the node
  const ingredient: Readable<IngredientControl<any>> = derived(
    [nodeStore, ingredientsStore],
    ([state, ingredients]: [
      NodeState,
      {
        [ingredientName: string]: IngredientControl<{}>;
      }
    ]) => state && ingredients[state.type]
  );

  // get a list of options for select type
  // just take all from the ingredients store and make them key and value
  const typeOptionsStore: Readable<{
    [typeName: string]: string;
  }> = derived(ingredientsStore, (ingredients) =>
    Object.keys(ingredients).reduce(
      (previous, current) => ({ ...previous, [current]: current }),
      {}
    )
  );

  // these will bind to the terminal racks inside
  let terminalRackContainers: {
    in: { [parameterName: string]: HTMLElement };
    out: { [parameterName: string]: HTMLElement };
  } = { in: {}, out: {} };

  // if the node type changes update the store
  function updateType(event: CustomEvent<string>) {
    let defaultNode = $ingredientsStore[event.detail].default(
      $nodeStore.nodeId,
      get($nodeStore.coords)
    );

    updateNode(defaultNode);
  }

  // use the selected ingredient to attach tweakpane
  function attach(pane: Pane): IngredientControlHandle {
    let parameterInputs = $ingredient.attach(pane, $nodeStore);

    Object.entries(parameterInputs).forEach(([name, input]) => {
      input.controller_.valueController.view.element.parentElement.style.width =
        "100px";
    });

    // attaching bound divs to terminal racks
    // $node.racks specifies if a rack should be attached
    Object.keys($nodeStore.racks.in).forEach((parameterName) => {
      parameterInputs[parameterName].controller_.view.element.prepend(
        terminalRackContainers.in[parameterName]
      );
    });

    Object.keys($nodeStore.racks.out).forEach((parameterName) => {
      parameterInputs[parameterName].controller_.view.element.append(
        terminalRackContainers.out[parameterName]
      );
    });

    return parameterInputs;
  }

  // delete node on close button
  function handleClose(event: MouseEvent) {
    removeNode($nodeStore);
  }

  let grabTarget: HTMLElement;

  const initialLocation = get($nodeStore.coords);

  function centerOnInitialLocationAction(element: HTMLElement) {
    const midpoint = element.getBoundingClientRect().width / 2;
    element.style.left = initialLocation.x - midpoint + "px";
  }

  const nodeHeaderSize = 12;
  $: styleVars = {
    nodeHeaderSize: nodeHeaderSize + "px",
  };
</script>

<div
  class="node no-select"
  style="top: {initialLocation.y - nodeHeaderSize / 2}px;"
  use:centerOnInitialLocationAction
  use:draggableAction={grabTarget}
  use:cssVars={styleVars}
>
  <div class="header">
    <div class="grab" bind:this={grabTarget} class:dragging>
      <div class="grab-dot" />
      <div class="grab-dot" />
    </div>

    <div class="close" on:click={handleClose} />
  </div>
  <PaneWrapper
    actionDescriptions={[]}
    type={$nodeStore.type}
    typeOptions={$typeOptionsStore}
    {attach}
    on:updateType={updateType}
  />
</div>

{#each Object.entries($nodeStore.racks.in) as [parameterName, rackState] (parameterName)}
  <TerminalRack
    bind:container={terminalRackContainers.in[parameterName]}
    {parameterName}
    parameterType={rackState.parameterType}
    direction={TerminalDirection.in}
  />
{/each}

{#each Object.entries($nodeStore.racks.out) as [parameterName, rackState] (parameterName)}
  <TerminalRack
    bind:container={terminalRackContainers.out[parameterName]}
    {parameterName}
    parameterType={rackState.parameterType}
    direction={TerminalDirection.out}
  />
{/each}

<style>
  .no-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .node {
    position: absolute;
    z-index: 1;
    display: block;
  }
  .header {
    display: flex;
    height: var(--nodeHeaderSize);
    margin-bottom: 4px;
  }

  .grab {
    background-color: var(--tp-base-background-color);

    box-shadow: 0 2px 4px var(--tp-base-shadow-color);

    border-radius: 6px 0px 0px 6px;

    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    cursor: grab;
  }
  .grab:hover {
    filter: brightness(90%) saturate(150%);
  }

  .grab-dot {
    background-color: var(--tp-button-background-color-hover);
    border-radius: 50%;
    height: 4px;
    width: 4px;
    margin: 2px;
  }

  .close {
    background-color: var(--close-color);
    box-shadow: 0 2px 4px var(--tp-base-shadow-color);

    border-radius: 0px 6px 6px 0px;

    width: var(--nodeHeaderSize);
    margin-left: 5px;
  }

  .close:hover {
    filter: brightness(90%) saturate(150%);
    cursor: pointer;
  }
</style>
