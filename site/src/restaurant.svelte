<script lang="typescript">
  import { v4 as uuidv4 } from "uuid";

  import { addNode, nodesStore } from "./nodes/nodes";
  import { connectionsStore } from "./connections/connections";

  import Node from "./nodes/Node.svelte";
  import CursorCircle from "./cursor-circle/CursorCircle.svelte";
  import { ColorControl } from "./ingredients/color";
  // import Cable from "./cable/cable.svelte";

  const defaultNode = () => new ColorControl().default(uuidv4());

  let mouseX: number;
  let mouseY: number;

  function mousemove(event: MouseEvent) {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }

  let holdingCable = false;

  // let anchorTerminal: HTMLElement;

  // let rect = anchorTerminal.getBoundingClientRect();

  function changeViewport() {}
</script>

<canvas height={window.innerHeight} width={window.innerWidth} />

{#each Object.entries($nodesStore) as [id, node]}
  <Node draggable={true} {...node} />
{/each}

<svelte:window on:mousemove={mousemove} />

<!-- {#if holdingCable}
  <Cable x1={rect} y1={rect} x2={mouseX} y2={mouseY} />
{/if}

{#each Object.entries($connectionsStore) as [id, connection]}
  <Cable
    origin={() =>
      $nodesStore[connection.in.nodeId].racks[connection.in.inputName]}
  />
{/each} -->

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
