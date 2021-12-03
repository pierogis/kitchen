import { BladeController, View } from "@tweakpane/core";
import { BladeApi, Pane } from "tweakpane";
import { IngredientType } from "../Cargo.toml";
import * as ImagePlugin from "tweakpane-image-plugin";

export interface INodeControl {
  attach(pane: Pane): void;
  detach(pane: Pane): void;
}

abstract class NodeControl {
  input: BladeApi<BladeController<View>>;
  abstract attach(pane: Pane);

  detach(pane: Pane) {
    pane.remove(this.input);
  }
}

export interface IIngredientControl<T extends IngredientType>
  extends INodeControl {
  attach(pane: Pane): void;
  detach(pane: Pane): void;

  emit(): any;
}

abstract class IngredientControl<T extends IngredientType>
  extends NodeControl
  implements IIngredientControl<T>
{
  type: T;

  abstract emit();
}

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
    this.input = pane
      .addInput({ color: { r: this.r, g: this.g, b: this.b } }, "color")
      .on("change", (ev) => {
        this.r = ev.value.r;
        this.g = ev.value.g;
        this.b = ev.value.b;
      });
  }

  emit() {
    return {
      r: Math.round(this.r),
      g: Math.round(this.g),
      b: Math.round(this.b),
    };
  }
}

export class PierogiControl extends IngredientControl<IngredientType.Pierogi> {
  type: IngredientType.Pierogi;
  src: string;

  attach(pane: Pane) {
    pane.registerPlugin(ImagePlugin);

    const params = {
      image: new Image(),
    };

    this.input = pane
      .addInput(params, "image", {
        extensions: ".jpg, .gif",
      })
      .on("change", (ev) => {
        this.src = ev.value.src;
        console.log(this.src);
      });
  }

  emit() {
    return { src: this.src };
  }
}

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

    this.input = pane
      .addInput(params, "width", {
        step: 1,
      })
      .on("change", (ev) => {
        this.width = ev.value;
        this.resolutionChangeCallback(this.width, this.height);
      });

    this.input = pane
      .addInput(params, "height", {
        step: 1,
      })
      .on("change", (ev) => {
        this.height = ev.value;
        this.resolutionChangeCallback(this.width, this.height);
      });
  }
}
