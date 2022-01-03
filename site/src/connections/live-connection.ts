import { writable, Writable } from "svelte/store";
import type { TerminalDirection } from "../terminals/terminals";
import type { ConnectionInputType } from "./connections";

// object describing the live cable for target terminals
// including callback should a new connection happen in ui
export const liveConnectionStore: Writable<{
  // only react if this a compatible terminal
  connectionId: string;
  inputType: ConnectionInputType;
  anchorNodeId: string;
  anchorInputName: string;
  anchorTerminalDirection: TerminalDirection;
  dragTerminalDirection: TerminalDirection;
  anchorCoordsStore: Writable<{ x: number; y: number }>;
  dragCoordsStore: Writable<{ x: number; y: number }>;
  // call this when releasing the live terminal, if this live cable is compatible
  attach: (targetNodeId: string, targetInputName: string) => void;
} | null> = writable(null);
