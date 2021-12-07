<script lang=ts>
  import { writable } from "svelte/store";
  import PlateControl from "./plate-control.svelte";
  let connections = writable();

  let viewportHeight = window.innerHeight;
  let viewportWidth = window.innerWidth;

  function changeViewport() {}
</script>

<canvas height={window.innerHeight} width={window.innerWidth} />
<div class="plate">
  <PlateControl
    height={window.innerHeight}
    width={window.innerWidth}
    on:change={changeViewport}
  />
</div>

<style>
  :global(:root) {
    --tp-button-background-color: hsla(0, 0%, 70%, 1);
    --tp-button-background-color-hover: hsla(0, 0%, 85%, 1);
    --tp-base-background-color: hsla(160, 20%, 75%, 0.8);
    --tp-label-foreground-color: hsla(230, 5%, 30%, 0.7);
    --tp-base-shadow-color: hsla(0, 0%, 0%, 0.2);
    --close-color: hsla(0, 80%, 70%, 0.8);
    --node-header-height: 12px;
  }
  :global(body){
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
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
