<script lang="typescript" context="module">
  import { v4 as uuidv4 } from "uuid";

  import { addNode } from "./nodes/nodes";
  import { addConnection, ConnectionState } from "./connections/connections";
  import { ColorControl } from "./ingredients/color";

  addNode(new ColorControl().default("color"));

  addConnection({
    connectionId: "init",
    in: {
      nodeId: "plate",
      inputName: "height",
    },
    out: {
      nodeId: "color",
      inputName: "color",
    },
  });

  const defaultNode = () => new ColorControl().default(uuidv4());
</script>

<script lang="typescript">
  import { derived, get, writable, Writable } from "svelte/store";

  import { nodesStore } from "./nodes/nodes";
  import { connectionsStore } from "./connections/connections";

  import Node from "./nodes/Node.svelte";
  import CursorCircle from "./cursor-circle/CursorCircle.svelte";
  import Cable from "./cable/Cable.svelte";
  import { afterUpdate, getContext, setContext } from "svelte";
  import type {
    NodeRectUpdateCallbacksState,
    RectUpdateCallback,
  } from "./terminals/terminals";

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

  // derived(connectionsStore, ($connections) => {
  //   Object.entries($connections).forEach(([connectionId, connection]) => {
  //     connection.in.nodeId;
  //   });
  // });

  function calculateCenter(rect: DOMRect): { x: number; y: number } {
    let x = rect.x + rect.width / 2;
    let y = rect.y + rect.height / 2;

    return { x, y };
  }

  let connectionsCoords: Writable<{
    [key: string]: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };
  }> = writable({});

  Object.keys($nodesStore).forEach((nodeId: string) => {
    setContext(
      nodeId,
      writable<NodeRectUpdateCallbacksState>({ in: {}, out: {} })
    );
  });

  // put connectionsCoords updating callbacks in context
  // this needs to happen after Node straps on all of the inputs sets
  $: {
    Object.entries($connectionsStore).forEach(([connectionId, connection]) => {
      // callback that will update half of connection's coordinates
      let updateInCoords = (rect: DOMRect) => {
        let center = calculateCenter(rect);
        connectionsCoords.update((coords) => {
          coords[connectionId] = {
            ...coords[connectionId],
            x2: center.x,
            y2: center.y,
          };
          return coords;
        });
      };

      let updateOutCoords = (rect: DOMRect) => {
        let center = calculateCenter(rect);
        connectionsCoords.update((coords) => {
          coords[connectionId] = {
            ...coords[connectionId],
            x1: center.x,
            y1: center.y,
          };
          return coords;
        });
      };

      let inKey = connection.in.nodeId;

      let inNodeCallbacks: Writable<NodeRectUpdateCallbacksState> =
        getContext(inKey);

      inNodeCallbacks.update((callbacks: NodeRectUpdateCallbacksState) => {
        if (callbacks.in[connection.in.inputName] === undefined) {
          callbacks.in[connection.in.inputName] = {};
        }
        callbacks.in[connection.in.inputName][connectionId] = updateInCoords;
        return callbacks;
      });

      let outKey = connection.out.nodeId;

      let outNodeCallbacks: Writable<NodeRectUpdateCallbacksState> =
        getContext(outKey);

      outNodeCallbacks.update((callbacks: NodeRectUpdateCallbacksState) => {
        if (callbacks.out[connection.out.inputName] === undefined) {
          callbacks.out[connection.out.inputName] = {};
        }
        callbacks.out[connection.out.inputName][connectionId] = updateOutCoords;
        return callbacks;
      });
    });
  }
</script>

<canvas height={window.innerHeight} width={window.innerWidth} />

{#each Object.entries($nodesStore) as [id, node]}
  <Node draggable={true} {...node} />
{/each}

<svelte:window on:mousemove={mousemove} />

<!-- {#if holdingCable}
  <Cable x1={rect} y1={rect} x2={mouseX} y2={mouseY} />
{/if} -->

{#each Object.entries($connectionsCoords) as [connectionId, coords]}
  {#if coords.x1 && coords.y1 && coords.x2 && coords.y2}
    <Cable {...coords} />
  {/if}
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
