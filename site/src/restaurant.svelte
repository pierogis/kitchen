<script lang="typescript" context="module">
  import { v4 as uuidv4 } from "uuid";

  import { addNode } from "./nodes/nodes";
  import { addConnection } from "./connections/connections";
  import { ColorControl } from "./ingredients/color";

  addNode(new ColorControl().default("color"));

  addConnection({
    id: "init",
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
  import { derived, Readable } from "svelte/store";

  import { nodesStore } from "./nodes/nodes";
  import { connectionsStore } from "./connections/connections";
  import {
    TerminalDirection,
    terminalRectsStore,
    TerminalRectState,
  } from "./terminals/terminals";

  import Node from "./nodes/Node.svelte";
  import CursorCircle from "./cursor-circle/CursorCircle.svelte";
  import Cable from "./cable/Cable.svelte";

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

  function calculateCenter(rect: DOMRect): { x: number; y: number } {
    let x = rect.x + rect.width / 2;
    let y = rect.y + rect.height / 2;

    return { x, y };
  }

  let terminalRectCenters = derived(terminalRectsStore, ($rects) => {
    return Object.entries($rects).reduce(
      (
        accumulator: {
          nodeId: string;
          inputName: string;
          direction: TerminalDirection;
          center: { x: number; y: number };
        }[],
        [id, rackStateArray]
      ) => {
        return [
          ...accumulator,
          ...rackStateArray.map((state: TerminalRectState) => {
            return {
              nodeId: state.nodeId,
              inputName: state.inputName,
              direction: state.direction,
              center: calculateCenter(state.rect),
            };
          }),
        ];
      },
      []
    );
  });

  let connectionCenters: Readable<
    {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }[]
  > = derived(
    [connectionsStore, terminalRectCenters],
    ([$connections, $centers]) => {
      return Object.entries($connections)
        .map(([id, connection]) => {
          let inCenter = $centers.find((rect) => {
            return (
              rect.inputName == connection.in.inputName &&
              rect.nodeId == connection.in.nodeId &&
              rect.direction == TerminalDirection.in
            );
          });
          let outCenter = $centers.find((rect) => {
            return (
              rect.inputName == connection.out.inputName &&
              rect.nodeId == connection.out.nodeId &&
              rect.direction == TerminalDirection.out
            );
          });

          if (inCenter && outCenter) {
            return {
              x1: inCenter.center.x,
              y1: inCenter.center.y,
              x2: outCenter.center.x,
              y2: outCenter.center.y,
            };
          }
        })
        .filter((center) => center !== undefined);
    }
  );
</script>

<canvas height={window.innerHeight} width={window.innerWidth} />

{#each Object.entries($nodesStore) as [id, node]}
  <Node draggable={true} {...node} />
{/each}

<svelte:window on:mousemove={mousemove} />

<!-- {#if holdingCable}
  <Cable x1={rect} y1={rect} x2={mouseX} y2={mouseY} />
{/if} -->

{#each $connectionCenters as connection}
  <Cable
    x1={connection.x1}
    y1={connection.y1}
    x2={connection.x2}
    y2={connection.y2}
  />
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
