import { writable, Writable } from "svelte/store";
import { TerminalDirection } from "../terminals/terminals";
import { addConnection, ConnectionInputType } from "./connections";

export type LiveConnectionState = {
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
} | null;

// object describing the live cable for target terminals
// including callback should a new connection happen in ui
export const liveConnectionStore: Writable<LiveConnectionState> =
  writable(null);

export function createLiveConnection(
  connectionId: string,
  anchorNodeId: string,
  anchorInputName: string,
  anchorDirection: TerminalDirection,
  dragDirection: TerminalDirection,
  inputType: ConnectionInputType,
  location: { x: number; y: number }
) {
  let attach: (targetNodeId: string, targetInputName: string) => void;
  // when a terminal gets a mouseup, add a new connection depending on the in/out
  // TODO: this code should be the same for disconnectLiveConnection
  if (anchorDirection == TerminalDirection.in) {
    attach = (targetNodeId: string, targetInputName: string) => {
      addConnection({
        connectionId: connectionId,
        inputType: inputType,
        in: {
          nodeId: anchorNodeId,
          inputName: anchorInputName,
        },
        out: {
          nodeId: targetNodeId,
          inputName: targetInputName,
        },
      });
    };
  } else {
    attach = (targetNodeId: string, targetInputName: string) => {
      addConnection({
        connectionId: connectionId,
        inputType: inputType,
        in: {
          nodeId: targetNodeId,
          inputName: targetInputName,
        },
        out: {
          nodeId: anchorNodeId,
          inputName: anchorInputName,
        },
      });
    };
  }

  liveConnectionStore.set({
    connectionId: connectionId,
    anchorNodeId: anchorNodeId,
    anchorInputName: anchorInputName,
    inputType: inputType,
    anchorTerminalDirection: anchorDirection,
    dragTerminalDirection: dragDirection,
    dragCoordsStore: writable(location),
    anchorCoordsStore: writable({ x: undefined, y: undefined }),
    attach: attach,
  });
}
