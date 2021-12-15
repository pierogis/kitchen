import { Writable, writable } from "svelte/store";

export enum TerminalDirection {
  in = "in",
  out = "out",
}

interface TerminalRectState {
  id: string;
  nodeId: string;
  inputName: string;
  direction: TerminalDirection;
  rect: DOMRect;
}

// key by terminal id
let terminalRectsStore: Writable<{
  [key: string]: TerminalRectState;
}> = writable({});

export function updateTerminalRect(state: TerminalRectState) {
  terminalRectsStore.update(($terminalRects) => {
    $terminalRects[state.id] = state;
    return $terminalRects;
  });
}
