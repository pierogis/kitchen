<script lang="typescript">
  import { createEventDispatcher, onMount, SvelteComponent } from "svelte";
  import cssVars from "svelte-css-vars";
  import { derived, Readable } from "svelte/store";
  import { Pane, TpChangeEvent } from "tweakpane";
  import { Ingredient, ingredientsStore } from "../ingredients/ingredients";
  import { deleteNode, nodesStore, NodeState, updateNode } from "./nodes";

  export let draggable: boolean;
  // export let ingredientType: string;
  // export let ingredientAttaches: {
  //   [key: string]: (pane: Pane) => void;
  // };

  //   type ControlComponent<T> = {
  //     component: new (...args: any) => SvelteComponent;
  //   };

  let container: HTMLElement;

  let top: number;
  let left: number;
  let dragging = false;

  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  function dragMouseDown(e: MouseEvent) {
    e.preventDefault();
    dragging = true;
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e: MouseEvent) {
    if (dragging && e.button == 0) {
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      top = container.offsetTop - pos2;
      left = container.offsetLeft - pos1;
      container.style.top = top + "px";
      container.style.left = left + "px";
    }
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    dragging = false;
    document.onmouseup = null;
    document.onmousemove = null;
  }

  function close(e: MouseEvent) {
    deleteNode($node);
  }

  let pane: Pane;
  export let id: string;

  let node: Readable<NodeState> = derived(nodesStore, ($nodes) => $nodes[id]);

  let ingredients = $ingredientsStore;

  let ingredient: Readable<Ingredient> = derived(
    ingredientsStore,
    ($ingredients) => $ingredients[$node.type]
  );

  function updateType(event: TpChangeEvent<string>) {
    $node.type = event.value;
    updateNode($node);
  }

  onMount(() => {
    pane = new Pane({ container: container });

    pane
      .addInput({ type: $ingredient.type }, "type", {
        options: ingredients,
      })
      .on("change", updateType);

    $ingredient.attach(pane);
  });

  const nodeHeaderSize = 12;

  $: styleVars = {
    nodeHeaderSize: nodeHeaderSize + "px",
  };
</script>

<div
  class="node no-select"
  class:dragging
  bind:this={container}
  use:cssVars={styleVars}
>
  <div class="header">
    <div class="grab" on:mousedown={dragMouseDown}>
      <div class="grab-dot" />
      <div class="grab-dot" />
    </div>

    <div class="close" on:click={close} />
  </div>
</div>

<style>
  .no-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .node {
    position: absolute;
    z-index: 9;
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
