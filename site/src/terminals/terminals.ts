import { Writable, writable } from "svelte/store";

export enum TerminalDirection {
  in = "in",
  out = "out",
}

export interface TerminalRectState {
  rackId: string;
  i: number;
  nodeId: string;
  inputName: string;
  direction: TerminalDirection;
  rect: DOMRect;
}

// key by terminal id
export let terminalRectsStore: Writable<{
  [key: string]: TerminalRectState[];
}> = writable({});

export function addTerminalRect(state: TerminalRectState) {
  console.log();
  terminalRectsStore.update(($terminalRects) => {
    $terminalRects[state.rackId].push(state);
    return $terminalRects;
  });
}

export function updateTerminalRect(state: TerminalRectState) {
  console.log();
  terminalRectsStore.update(($terminalRects) => {
    if ($terminalRects[state.rackId] === undefined) {
      $terminalRects[state.rackId] = [];
    }
    $terminalRects[state.rackId][state.i] = state;
    return $terminalRects;
  });
}
