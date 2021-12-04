import { Pane } from "tweakpane";
import * as ImagePlugin from "tweakpane-image-plugin";

import { IngredientType } from "../Cargo.toml";

import { IngredientControl } from "./common";
import { TerminalType } from "../terminal";

export class PierogiControl extends IngredientControl<IngredientType.Pierogi> {
  type: IngredientType.Pierogi;
  src: string;
  width: number = 0;
  height: number = 0;

  attach(pane: Pane) {
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
      TerminalType.in
    );

    this.attachTerminalRack(
      imageInput.controller_.view.element,
      TerminalType.out
    );

    this.attachTerminalRack(
      widthMonitor.controller_.view.element,
      TerminalType.in
    );

    this.attachTerminalRack(
      widthMonitor.controller_.view.element,
      TerminalType.out
    );

    this.attachTerminalRack(
      heightMonitor.controller_.view.element,
      TerminalType.in
    );

    this.attachTerminalRack(
      heightMonitor.controller_.view.element,
      TerminalType.out
    );
  }

  emit() {
    return { src: this.src };
  }
}
