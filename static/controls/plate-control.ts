import { Pane } from "tweakpane";

import { NodeControl } from "./common";
import { TerminalType } from "../terminal";

export class PlateControl extends NodeControl {
  width: number;
  height: number;
  resolutionChangeCallback: (width: number, height: number) => void;

  constructor(
    width: number,
    height: number,
    resolutionChangeCallback: (width: number, height: number) => void
  ) {
    super();
    this.width = width;
    this.height = height;
    this.resolutionChangeCallback = resolutionChangeCallback;
  }

  attach(pane: Pane) {
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
      TerminalType.in
    );

    this.attachTerminalRack(
      heightInput.controller_.view.element,
      TerminalType.in
    );
  }
}
