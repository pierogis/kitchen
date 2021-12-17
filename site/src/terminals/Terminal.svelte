<script lang="typescript">
  import cssVars from "svelte-css-vars";

  import type { TerminalDirection } from "./terminals";

  export let direction: TerminalDirection;
  export let expanded: boolean;
  export let terminalHeight: number;
  export let cabled;

  export let container: HTMLElement;

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

  $: styleVars = {
    terminalHeight: terminalHeight + "px",
  };
</script>

<div
  bind:this={container}
  class="terminal {direction}"
  class:expanded
  class:cabled
  use:cssVars={styleVars}
/>

<style>
  .terminal {
    position: relative;
    width: 0px;
    height: var(--terminalHeight);

    border: 0px outset var(--cable-color-number);
    background-color: hsla(0, 0%, 40%, 1);

    transition: all 300ms, border 300ms;
    z-index: 1;
    cursor: grab;
  }

  .in {
    border-radius: 10% 50% 50% 10%;
    right: 2px;
  }

  .out {
    border-radius: 50% 10% 10% 50%;
    left: 2px;
  }

  .cabled {
    /* border: 2px inset hsla(0, 0%, 20%, 0.5); */
    border: 2px inset var(--cable-color-number);
    background-color: var(--tp-button-background-color-hover);
    width: 4px;

    margin: -2px;
    z-index: 2;
  }

  .cabled.in {
    border-radius: 50% 10% 10% 50%;
    right: 4px;
  }

  .cabled.out {
    border-radius: 10% 50% 50% 10%;
    left: 4px;
  }

  .expanded {
    width: var(--terminalHeight);
  }

  .expanded.in {
    right: 0px;
    border-radius: 50% 50% 50% 50%;
  }

  .expanded.out {
    left: 0px;
    border-radius: 50% 50% 50% 50%;
  }
</style>
