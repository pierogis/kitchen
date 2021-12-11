import { Pane } from "tweakpane";
import * as ImagePlugin from "tweakpane-image-plugin";

import { IngredientType } from "../Cargo.toml";

import { IngredientControl } from "./common";
import { Terminal, TerminalDirection, TerminalRack } from "../../terminalnal";

export class PierogiControl extends IngredientControl<IngredientType.Pierogi> {
  type: IngredientType.Pierogi;
  src: string;
  width: number = 0;
  height: number = 0;

  constructor(
    pane: Pane,
    addTerminalCallback: (terminalRack: TerminalRack) => void,
  ) {
    super(addTerminalCallback);

    pane.registerPlugin(ImagePlugin);

    const params = {
      image: new Image(),
    };

    let imageInput = pane
      .addInput(params, "image", {
        extensions: ".jpg, .png, .gif",
      })
      .on("change", (ev) => {
        this.src = ev.value.src;
        this.width = ev.value.width;
        this.height = ev.value.height;
      });
    this.inputs.push(imageInput);

    let widthMonitor = pane.addMonitor(this, "height", {
      format: (v: number) => Math.trunc(v),
    });
    this.inputs.push(widthMonitor);

    let heightMonitor = pane.addMonitor(this, "width", {
      format: (v: number) => Math.trunc(v),
    });
    this.inputs.push(heightMonitor);

    this.attachTerminalRack(
      imageInput.controller_.view.element,
      TerminalDirection.in
    );

    this.attachTerminalRack(
      imageInput.controller_.view.element,
      TerminalDirection.out
    );

    this.attachTerminalRack(
      widthMonitor.controller_.view.element,
      TerminalDirection.in
    );

    this.attachTerminalRack(
      widthMonitor.controller_.view.element,
      TerminalDirection.out
    );

    this.attachTerminalRack(
      heightMonitor.controller_.view.element,
      TerminalDirection.in
    );

    this.attachTerminalRack(
      heightMonitor.controller_.view.element,
      TerminalDirection.out
    );
  }

  emit() {
    return { src: this.src };
  }
}
