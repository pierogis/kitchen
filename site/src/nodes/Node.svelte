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
  import { deleteNode, nodesStore, NodeState, updateNode } from "./nodes";

  import PaneWrapper from "./PaneWrapper.svelte";

  export let draggable: boolean;
  export let nodeId: string;

  setContext("nodeId", nodeId);

  let container: HTMLElement;

  let top: number;
  let left: number;
  let dragging = false;

  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  // for dragging the node
  function dragMouseDown(e: MouseEvent) {
    e.preventDefault();
    dragging = true;
    // get the mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = stopDragElement;
    // call a function whenever the cursor moves
    document.onmousemove = elementDrag;
  }

  function elementDrag(e: MouseEvent) {
    if (dragging && e.button == 0) {
      e.preventDefault();
      // calculate the new cursor position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position
      top = container.offsetTop - pos2;
      left = container.offsetLeft - pos1;
      container.style.top = top + "px";
      container.style.left = left + "px";
    }
  }

  function stopDragElement() {
    // stop moving when mouse button is released:
    dragging = false;
    document.onmouseup = null;
    document.onmousemove = null;
  }

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
  function handleClose(e: MouseEvent) {
    deleteNode($node);
  }

  const nodeHeaderSize = 12;
  $: styleVars = {
    nodeHeaderSize: nodeHeaderSize + "px",
  };
</script>

<div class="node no-select" bind:this={container} use:cssVars={styleVars}>
  <div class="header">
    <div class="grab" class:dragging on:mousedown={dragMouseDown}>
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

  .dragging {
    cursor: grabbing;
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
