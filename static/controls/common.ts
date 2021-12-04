import { BladeController, View } from "@tweakpane/core";
import { BladeApi, Pane } from "tweakpane";

import { IngredientType } from "../Cargo.toml";

import { TerminalType, TerminalRack } from "./terminal";

export interface INodeControl {
  attach(pane: Pane): void;
  detach(pane: Pane): void;
}

export abstract class NodeControl {
  inputs: BladeApi<BladeController<View>>[];

  constructor() {
    this.inputs = [];
  }

  abstract attach(pane: Pane);

  detach(pane: Pane) {
    for (var input of this.inputs) {
      pane.remove(input);
    }
  }

  attachTerminalRack(target: HTMLElement, terminalRackType: TerminalType) {
    let rack = new TerminalRack();

    rack.attach(target, terminalRackType);
  }
}

export interface IIngredientControl<T extends IngredientType>
  extends INodeControl {
  attach(pane: Pane): void;
  detach(pane: Pane): void;

  emit(): any;
}

export abstract class IngredientControl<T extends IngredientType>
  extends NodeControl
  implements IIngredientControl<T>
{
  type: T;

  abstract emit();
}
