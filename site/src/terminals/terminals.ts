export enum TerminalDirection {
  in = "in",
  out = "out",
}

export type RectUpdateCallback = (rect: DOMRect) => void;

export type NodeTerminalRectsUpdateCallbacksState = {
  in: {
    [inputName: string]: {
      [connectionId: string]: RectUpdateCallback;
    };
  };
  out: {
    [inputName: string]: {
      [connectionId: string]: RectUpdateCallback;
    };
  };
};
