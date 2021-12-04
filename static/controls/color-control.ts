import { Pane } from "tweakpane";

import { IngredientType } from "../Cargo.toml";

import { IngredientControl } from "./common";
import { TerminalType } from "../terminal";

export class ColorControl extends IngredientControl<IngredientType.Color> {
  type: IngredientType.Color;
  r: number;
  g: number;
  b: number;

  constructor() {
    super();
    this.r = 120;
    this.g = 150;
    this.b = 190;
  }

  attach(pane: Pane) {
    let colorInput = pane
      .addInput({ color: { r: this.r, g: this.g, b: this.b } }, "color")
      .on("change", (ev) => {
        this.r = ev.value.r;
        this.g = ev.value.g;
        this.b = ev.value.b;
      });

    this.inputs.push(colorInput);

    this.attachTerminalRack(
      colorInput.controller_.view.element,
      TerminalType.in
    );

    this.attachTerminalRack(
      colorInput.controller_.view.element,
      TerminalType.out
    );
  }

  emit() {
    return {
      r: Math.round(this.r),
      g: Math.round(this.g),
      b: Math.round(this.b),
    };
  }
}
