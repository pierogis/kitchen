import { derived, get, writable, Writable } from "svelte/store";
import { checkPointWithinBox } from "../common/utils";
import {
  allNodesTerminalCentersStore,
  TerminalDirection,
  terminalHeight,
} from "../terminals/terminals";
import {
  addConnection,
  ConnectionInputType,
  ConnectionState,
  updateConnection,
} from "./connections";

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
  attach: (
    targetNodeId: string,
    targetInputName: string,
    existingConnectionId?: string
  ) => void;
} | null;

// object describing the live cable for target terminals
// including callback should a new connection happen in ui
export const liveConnectionStore: Writable<LiveConnectionState> =
  writable(null);

export function anchorLiveConnection(
  connectionId: string,
  anchorNodeId: string,
  anchorInputName: string,
  anchorDirection: TerminalDirection,
  dragDirection: TerminalDirection,
  inputType: ConnectionInputType,
  location: { x: number; y: number }
) {
  let attach: (
    targetNodeId: string,
    targetInputName: string,
    existingConnectionId?: string
  ) => void;
  // when a terminal gets a mouseup, add a new connection depending on the in/out
  if (anchorDirection == TerminalDirection.in) {
    attach = (
      targetNodeId: string,
      targetInputName: string,
      existingConnectionId?: string
    ) => {
      // if this terminal is already connected, just update the connection's state to the new
      // node id, input name,
      let connectionState: ConnectionState = {
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
      };

      if (existingConnectionId) {
        connectionState.connectionId = existingConnectionId;
        updateConnection(connectionState);
      } else {
        addConnection(connectionState);
      }

      // need to delete live connection here
      liveConnectionStore.set(null);
    };
  } else {
    attach = (
      targetNodeId: string,
      targetInputName: string,
      existingConnectionId?: string
    ) => {
      let connectionState: ConnectionState = {
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
      };

      if (existingConnectionId) {
        connectionState.connectionId = existingConnectionId;

        updateConnection(connectionState);
      } else {
        addConnection(connectionState);
      }

      liveConnectionStore.set(null);
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

export const dropCableStore = derived(
  [liveConnectionStore, allNodesTerminalCentersStore],
  ([liveConnection, allNodesTerminalCenters]) => {
    // this subscription fires before the element is deleted
    return (coords: { x: number; y: number }) => {
      if (liveConnection) {
        const targetTerminals = allNodesTerminalCenters.filter(
          (nodeTerminalCenter) => {
            return (
              liveConnection.inputType == nodeTerminalCenter.inputType &&
              liveConnection.dragTerminalDirection ==
                nodeTerminalCenter.direction &&
              !(
                liveConnection.anchorNodeId == nodeTerminalCenter.nodeId &&
                liveConnection.anchorInputName == nodeTerminalCenter.inputName
              )
            );
          }
        );

        const nearTerminalDistance = 4;
        // expanding the rect
        const targetTerminal = targetTerminals.find((terminalCenter) => {
          const terminalCoords = get(terminalCenter.coords);

          const left =
            terminalCoords.x - (terminalHeight / 2 + nearTerminalDistance);
          const top =
            terminalCoords.y - (terminalHeight / 2 + nearTerminalDistance);
          const right =
            terminalCoords.x + (terminalHeight / 2 + nearTerminalDistance);
          const bottom =
            terminalCoords.y + (terminalHeight / 2 + nearTerminalDistance);

          return checkPointWithinBox(
            { x: coords.x, y: coords.y },
            { top: top, bottom: bottom, left: left, right: right }
          );
        });

        // use the callback from the liveConnection store
        if (targetTerminal) {
          liveConnection.attach(
            targetTerminal.nodeId,
            targetTerminal.inputName,
            targetTerminal.connectionId
          );
        } else {
          liveConnectionStore.set(null);
        }
      }
    };
  }
);
