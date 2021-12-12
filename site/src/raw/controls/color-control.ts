import { Pane } from "tweakpane";

import { IngredientType } from "../../../crate/Cargo.toml";

import { IngredientControl } from "./common";
import { Terminal, TerminalDirection, TerminalRack } from "../../terminalnal";

interface View {
  readonly element: HTMLElement;
}

class ColorView implements View {
  element: HTMLElement;
  constructor(
    doc: Document
  ) {
    this.element = doc.createElement('div')

    let pane = new Pane(
      {
        container: this.element
      }
    );

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
      TerminalDirection.in
    );

    this.attachTerminalRack(
      colorInput.controller_.view.element,
      TerminalDirection.out
    );
  }
}

export class ColorControl extends IngredientControl<IngredientType.Color> {
  type: IngredientType.Color;
  r: number;
  g: number;
  b: number;

  constructor(
    pane: Pane,
    addTerminalCallback: (terminalRack: TerminalRack) => void
  ) {
    super(addTerminalCallback);
    this.r = 120;
    this.g = 150;
    this.b = 190;

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
      TerminalDirection.in
    );

    this.attachTerminalRack(
      colorInput.controller_.view.element,
      TerminalDirection.out
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