<script lang="typescript">
  import { setContext, tick } from "svelte";
  import { derived, Readable } from "svelte/store";

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
  let node: Readable<NodeState> = derived(
    nodesStore,
    ($nodes) => $nodes[nodeId]
  );

  // use these IngredientControl classes to do non svelte display stuff
  // subscribe the type specified on the node
  let ingredientBuilder: Readable<IngredientControl<any>> = derived(
    node,
    (state: NodeState) => state && $ingredientsStore[state.type]
  );

  // get a list of options for select type
  // just take all from the ingredients store and make them key and value
  let typeOptions: {
    [key: string]: string;
  } = Object.keys($ingredientsStore).reduce(
    (previous, current) => ({ ...previous, [current]: current }),
    {}
  );

  // these will bind to the terminal racks inside
  let terminalRackContainers: {
    in: { [key: string]: HTMLElement };
    out: { [key: string]: HTMLElement };
  } = { in: {}, out: {} };

  // if the node type changes update the store
  function updateType(event: CustomEvent<string>) {
    let defaultNode = $ingredientsStore[event.detail].default($node.nodeId);

    updateNode(defaultNode);
  }

  // use the selected ingredient to attach tweakpane
  async function attach(pane: Pane): Promise<IngredientControlHandle> {
    let inputs = $ingredientBuilder.attach(pane, $node);

    // attach will cause an update
    await tick();
    // attaching bound divs to terminal racks
    // $node.racks specifies if a rack should be attached
    $node.racks.in.forEach((inputName) => {
      inputs[inputName].controller_.view.element.prepend(
        terminalRackContainers.in[inputName]
      );
    });

    $node.racks.out.forEach((inputName) => {
      inputs[inputName].controller_.view.element.append(
        terminalRackContainers.out[inputName]
      );
    });

    return inputs;
  }

  // delete node on close button
  function handleClose(event: MouseEvent) {
    removeNode($node);
  }

  let grabTarget: HTMLElement;

  const nodeHeaderSize = 12;
  $: styleVars = {
    nodeHeaderSize: nodeHeaderSize + "px",
  };
</script>

<div
  class="node no-select"
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
    type={$node.type}
    options={typeOptions}
    {attach}
    on:updateType={updateType}
  />
</div>

{#each $node.racks.in as inputName (inputName)}
  <TerminalRack
    bind:container={terminalRackContainers.in[inputName]}
    {inputName}
    direction={TerminalDirection.in}
  />
{/each}

{#each $node.racks.out as inputName (inputName)}
  <TerminalRack
    bind:container={terminalRackContainers.out[inputName]}
    {inputName}
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

    top: 50%;
    left: 50%;
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
