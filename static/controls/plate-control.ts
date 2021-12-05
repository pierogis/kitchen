import { Pane } from "tweakpane";

import { NodeControl } from "./common";
import { Terminal, TerminalDirection, TerminalRack } from "../terminal";

export class PlateControl extends NodeControl {
  width: number;
  height: number;
  resolutionChangeCallback: (width: number, height: number) => void;

  constructor(
    pane: Pane,
    width: number,
    height: number,
    resolutionChangeCallback: (width: number, height: number) => void,
    addTerminalCallback: (terminalRack: TerminalRack) => void
  ) {
    super(addTerminalCallback);
    this.width = width;
    this.height = height;
    this.resolutionChangeCallback = resolutionChangeCallback;

    const params = {
      width: this.width,
      height: this.height,
    };

    let widthInput = pane
      .addInput(params, "width", {
        step: 1,
      })
      .on("change", (ev) => {
        this.width = ev.value;
        this.resolutionChangeCallback(this.width, this.height);
      });

    this.inputs.push(widthInput);

    let heightInput = pane
      .addInput(params, "height", {
        step: 1,
      })
      .on("change", (ev) => {
        this.height = ev.value;
        this.resolutionChangeCallback(this.width, this.height);
      });

    this.inputs.push(heightInput);

    this.attachTerminalRack(
      widthInput.controller_.view.element,
      TerminalDirection.in
    );

    this.attachTerminalRack(
      heightInput.controller_.view.element,
      TerminalDirection.in
    );
  }
}
