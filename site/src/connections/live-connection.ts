import { writable, Writable } from "svelte/store";
import type { TerminalDirection } from "../terminals/terminals";
import type { ConnectionInputType } from "./connections";

// context keys

// callback on create a new connection
export const anchorLiveConnectionKey = {};

// callback on create a new connection
export const disconnectLiveConnectionKey = {};

// object describing the live cable for target terminals
// including callback should a new connection happen in ui
// export const liveTerminalKey = {};

export const liveTerminalStore: Writable<{
  // only react if this a compatible terminal
  anchorNodeId: string;
  anchorInputName: string;
  inputType: ConnectionInputType;
  dragTerminalDirection: TerminalDirection;
  // call this when releasing the live terminal, if this live cable is compatible
  attach: () => void;
} | null> = writable(null);
