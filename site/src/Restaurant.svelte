<script lang="ts" context="module">
  import { v4 as uuidv4 } from "uuid";

  import { addNode } from "./nodes/nodes";
  import { ColorControl } from "./ingredients/color";

  let color1 = new ColorControl().default("1");
  color1.racks.out = {};
  let color2 = new ColorControl().default("2");
  color2.racks.in = {};

  const initialState = {
    1: color1,
    2: color2,
  };

  nodesStore.set(initialState);

  const defaultNode = () => new ColorControl().default(uuidv4());
</script>

<script lang="ts">
  import { nodesStore } from "./nodes/nodes";

  import Node from "./nodes/Node.svelte";
  import CursorCircle from "./cursor-circle/CursorCircle.svelte";
  import Connections from "./connections/Connections.svelte";
</script>

<svelte:window on:scroll|preventDefault={() => {}} />

<canvas height={window.innerHeight} width={window.innerWidth} />

{#each Object.entries($nodesStore) as [nodeId, node]}
  <Node draggable={true} {...node} />
{/each}

<Connections />

<CursorCircle on:longpress={() => addNode(defaultNode())} />

<style>
  :global(:root) {
    --tp-button-background-color: hsla(0, 0%, 70%, 1);
    --tp-button-background-color-hover: hsla(0, 0%, 85%, 1);
    --tp-base-background-color: hsla(160, 20%, 75%, 0.8);
    --tp-label-foreground-color: hsla(230, 5%, 30%, 0.7);
    --tp-base-shadow-color: hsla(0, 0%, 0%, 0.2);
    --close-color: hsla(0, 80%, 70%, 0.8);
    --cable-color-number: rgba(120, 150, 190, 1);
  }
  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
      "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
      "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #282c34;
    margin: 0px;
  }
  canvas {
    pointer-events: none;
  }
</style>
