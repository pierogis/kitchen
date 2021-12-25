<script lang="ts">
  import { getContext } from "svelte";

  import { Readable, Writable, writable } from "svelte/store";
  import Cable from "../cable/Cable.svelte";
  import { calculateCenter } from "../common/utils";
  import Terminal from "../terminals/Terminal.svelte";
  import { terminalHeight } from "../terminals/TerminalRack.svelte";
  import { TerminalDirection } from "../terminals/terminals";
  import { allNodesTerminalRectsUpdateCallbacksKey } from "./connections";
  import { liveConnectionStore } from "./live-connection";

  export let mouseX: number;
  export let mouseY: number;

  // store a single set of coords for when a cable is being dragged
  const liveCoordsStore: Writable<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }> = writable();

  const updateLiveInCoords = (rect: DOMRect) => {
    let center = calculateCenter(rect);
    liveCoordsStore.update((coords) => {
      coords = {
        ...coords,
        x2: center.x,
        y2: center.y,
      };
      return coords;
    });
  };

  const updateLiveOutCoords = (rect: DOMRect) => {
    let center = calculateCenter(rect);
    liveCoordsStore.update((coords) => {
      coords = {
        ...coords,
        x1: center.x,
        y1: center.y,
      };
      return coords;
    });
  };

  let liveAnchorNodeId: string;
  let liveAnchorTerminalDirection: TerminalDirection;
  let liveAnchorInputName: string;

  const allNodesTerminalRectsUpdateCallbacksStore: Writable<{
    [nodeId: string]: { in: {}; out: {} };
  }> = getContext(allNodesTerminalRectsUpdateCallbacksKey);

  liveConnectionStore.subscribe((liveTerminal) => {
    if (liveTerminal) {
      liveAnchorNodeId = liveTerminal.anchorNodeId;
      liveAnchorInputName = liveTerminal.anchorInputName;

      // use an update live coords callback on the anchored terminal
      let updateLiveCoords: (rect: DOMRect) => void;

      if (liveTerminal.dragTerminalDirection == TerminalDirection.in) {
        updateLiveCoords = updateLiveOutCoords;
        liveAnchorTerminalDirection = TerminalDirection.out;
      } else {
        updateLiveCoords = updateLiveInCoords;
        liveAnchorTerminalDirection = TerminalDirection.in;
      }

      allNodesTerminalRectsUpdateCallbacksStore.update((allNodesCallbacks) => {
        // TODO: logic here to keep the nodes in the right order
        // make sure the inputName is in the callbacks store
        console.log(allNodesCallbacks);
        if (
          !allNodesCallbacks[liveAnchorNodeId][liveAnchorTerminalDirection][
            liveAnchorInputName
          ]
        ) {
          allNodesCallbacks[liveAnchorNodeId][liveAnchorTerminalDirection][
            liveAnchorInputName
          ] = {};
        }
        allNodesCallbacks[liveAnchorNodeId][liveAnchorTerminalDirection][
          liveAnchorInputName
        ] = {
          ...allNodesCallbacks[liveAnchorNodeId][liveAnchorTerminalDirection][
            liveAnchorInputName
          ],
          live: updateLiveCoords,
        };
        return allNodesCallbacks;
      });
    } else {
      if (
        liveAnchorNodeId &&
        liveAnchorTerminalDirection &&
        liveAnchorInputName
      ) {
        // remove the live position callback from this input terminal
        allNodesTerminalRectsUpdateCallbacksStore.update(
          (allNodesCallbacks) => {
            delete allNodesCallbacks[liveAnchorNodeId][
              liveAnchorTerminalDirection
            ][liveAnchorInputName]["live"];
            return allNodesCallbacks;
          }
        );
      }
    }
  });

  function dragTerminalAction(
    element: HTMLElement,
    params: { direction: TerminalDirection }
  ) {
    let dragTerminalTimer: NodeJS.Timer;

    element.style.top = mouseY + "px";
    element.style.left = mouseX + "px";

    const moveTerminal = (event: MouseEvent) => {
      event.preventDefault();
      element.style.top = event.y + "px";
      element.style.left = event.x + "px";
    };
    window.addEventListener("mousemove", moveTerminal);

    dragTerminalTimer = setInterval(() => {
      const rect = element.getBoundingClientRect();
      if (params.direction == TerminalDirection.in) {
        updateLiveInCoords(rect);
      } else if (params.direction == TerminalDirection.out) {
        updateLiveOutCoords(rect);
      }
    }, 10);

    // update restaurant that cable has been dropped
    const dropCable = () => {
      liveConnectionStore.set(null);
      window.removeEventListener("mouseup", dropCable);
    };
    window.addEventListener("mouseup", dropCable);

    return {
      update(newParams: { direction: TerminalDirection }) {
        params = newParams;
      },
      destroy() {
        window.removeEventListener("mousemove", moveTerminal);
        window.removeEventListener("mouseup", dropCable);
        clearInterval(dragTerminalTimer);
        liveCoordsStore.set(undefined);
      },
    };
  }
</script>

{#if $liveConnectionStore}
  {#if $liveCoordsStore && $liveCoordsStore.x1 && $liveCoordsStore.y1 && $liveCoordsStore.x2 && $liveCoordsStore.y2}
    <Cable {...$liveCoordsStore} />
  {/if}
  <Terminal
    actionDescriptions={[
      {
        action: dragTerminalAction,
        params: { direction: $liveConnectionStore.dragTerminalDirection },
      },
    ]}
    direction={$liveConnectionStore.dragTerminalDirection}
    expanded={true}
    cabled={true}
    live={true}
    {terminalHeight}
  />
{/if}
