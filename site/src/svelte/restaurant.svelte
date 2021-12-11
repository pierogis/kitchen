<script lang="typescript">
  import { nodesStore } from "./features/nodes/nodes";
  import Node from "./features/nodes/node.svelte";

  // import PierogiControl from "./pierogi-control.svelte";

  let viewportHeight = window.innerHeight;
  let viewportWidth = window.innerWidth;

  function changeViewport() {}
</script>

<canvas height={window.innerHeight} width={window.innerWidth} />

<!-- <div style="top: 50%; right 0px;">
  <Node draggable={false} id{node.id} />
</div> -->

{#each Object.entries($nodesStore) as [id, node]}
  <Node draggable={true} {...node} />
{/each}

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
  .plate {
    position: absolute;
    z-index: 9;
    display: block;

    top: 50%;
    right: 0px;
  }
</style>
