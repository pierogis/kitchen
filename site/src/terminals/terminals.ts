export enum TerminalDirection {
  in = "in",
  out = "out",
}

export type RectUpdateCallback = (rect: DOMRect) => void;

export type NodeTerminalRectsUpdateCallbacksState = {
  in: {
    // inputName
    [key: string]: {
      // connectionId
      [key: string]: RectUpdateCallback;
    };
  };
  out: {
    // inputName
    [key: string]: {
      // connectionId
      [key: string]: RectUpdateCallback;
    };
  };
};
