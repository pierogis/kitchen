import { writable, Writable } from "svelte/store";
import type { TerminalDirection } from "../terminals/terminals";
import type { ConnectionInputType } from "./connections";

// context keys:
// callback on create a new connection
export const anchorLiveConnectionKey = {};

// callback on create a new connection
export const disconnectLiveConnectionKey = {};

// object describing the live cable for target terminals
// including callback should a new connection happen in ui
export const liveConnectionStore: Writable<{
  // only react if this a compatible terminal
  connectionId: string;
  anchorNodeId: string;
  anchorInputName: string;
  inputType: ConnectionInputType;
  anchorTerminalDirection: TerminalDirection;
  dragTerminalDirection: TerminalDirection;
  // call this when releasing the live terminal, if this live cable is compatible
  attach: (targetNodeId: string, targetInputName: string) => void;
} | null> = writable(null);
