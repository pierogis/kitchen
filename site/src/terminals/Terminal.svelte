<script lang="typescript">
  import { afterUpdate, createEventDispatcher, onMount, tick } from "svelte";

  import type { TerminalDirection } from "./terminals";

  export let direction: TerminalDirection;
  export let expanded: boolean;
  let selected = false;

  let container: HTMLElement;

  // async function updateRect() {
  //   while (true) {
  //     await tick();
  //     let rect = container.getBoundingClientRect();
  //     console.log(rect);
  //   }
  // }

  // afterUpdate(() => {

  //   let rect = container.getBoundingClientRect();
  //     console.log(rect);
  // });

  let dispatch = createEventDispatcher();

  onMount(() => {
    setInterval(() => {
      let rect = container.getBoundingClientRect();
      dispatch("terminalRect", rect);
    }, 10);
  });

  // updateRect();

  function select(event) {
    selected = true;
  }

  // connections

  // function createCable(event: MouseEvent) {
  //   if (event.button == 0) {
  //         terminal.element.onmouseleave = null;

  //         terminalRack.lockExpand();

  //         let terminalRect = terminal.element.getBoundingClientRect();
  //         let x1 = terminalRect.x + terminalRect.width / 2;
  //         let y1 = terminalRect.y + terminalRect.height / 2;
  //         let cable = new Cable(x1, y1);

  //         let release = () => {
  //           document.body.onmousemove = null;
  //           document.body.onmouseup = null;
  //           terminalRack.unlockExpand();
  //           terminalRack.contract();
  //         };

  //         document.body.onmousemove = (ev: MouseEvent) => {
  //           updateLiveCable({x1: x1, y1: y1, x2: ev.clientX, y2: ev.clientY, live:true});
  //         };

  //         let matchingTerminals = this.getMatchingTerminalsCallback(terminal);
  //         for (let matchingTerminal of matchingTerminals) {
  //           matchingTerminal.element.onmouseup = (ev: MouseEvent) => {
  //             console.log("connection");
  //             ev.preventDefault();
  //             release();
  //             matchingTerminal.element.onmouseleave = null;
  //             matchingTerminal.element.onmouseup = null;

  //             let terminalRect =
  //               matchingTerminal.element.getBoundingClientRect();
  //             let x2 = terminalRect.x + terminalRect.width / 2;
  //             let y2 = terminalRect.y + terminalRect.height / 2;

  //             cable.draw(x1, y1, x2, y2);
  //           };
  //         }

  //         document.body.onmouseup = (ev: MouseEvent) => {
  //           ev.preventDefault();
  //           for (let matchingTerminal of matchingTerminals) {
  //             matchingTerminal.element.onmouseup = null;
  //           }

  //           console.log;

  //           terminal.deselect();
  //           cable.dispose();
  //         };
  //       }
  //     };
  // }
</script>

<div
  bind:this={container}
  class="terminal {direction}"
  class:expanded
  class:selected
  on:mouseover={select}
/>

<style>
  .terminal {
    border: 0px outset hsla(0, 0%, 20%, 0.3);
    background-color: var(--tp-button-background-color-hover);
    position: relative;
    width: 4px;
    height: 10px;
    transition: all 300ms, border 300ms;
    z-index: -1;
  }

  .selected {
    border: 2px inset hsla(0, 0%, 20%, 0.5);

    cursor: grab;
  }

  .in {
    border-radius: 50% 10% 10% 50%;
    right: 4px;
  }

  .out {
    border-radius: 10% 50% 50% 10%;
    left: 4px;
  }

  .expanded {
    width: 10px;
    border-radius: 50% 50% 50% 50%;
  }

  .terminal.expanded.in {
    margin-right: -8px;
  }

  .terminal.expanded.out {
    margin-left: -8px;
  }
</style>
