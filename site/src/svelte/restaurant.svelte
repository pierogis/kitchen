<script lang="typescript">
  import { addNode, nodesStore } from "./features/nodes/nodes";
  import Node from "./features/nodes/node.svelte";
  import CursorCircle from "./features/cursor-circle/cursor-circle.svelte";
  import { ColorControl } from "./features/ingredients/color";
  import { v4 as uuidv4 } from "uuid";

  const defaultNode = () => new ColorControl().default(uuidv4());

  function changeViewport() {}
</script>

<canvas height={window.innerHeight} width={window.innerWidth} />

{#each Object.entries($nodesStore) as [id, node]}
  <Node draggable={true} {...node} />
{/each}

<CursorCircle on:longpress={() => addNode(defaultNode())} />

<style>
  :global(:root) {
    --tp-button-background-color: hsla(0, 0%, 70%, 1);
    --tp-button-background-color-hover: hsla(0, 0%, 85%, 1);
    --tp-base-background-color: hsla(160, 20%, 75%, 0.8);
    --tp-label-foreground-color: hsla(230, 5%, 30%, 0.7);
    --tp-base-shadow-color: hsla(0, 0%, 0%, 0.2);
    --close-color: hsla(0, 80%, 70%, 0.8);
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
