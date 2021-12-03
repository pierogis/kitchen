import { BladeController, View } from "@tweakpane/core";
import { BladeApi, Pane } from "tweakpane";
import { IngredientType } from "../Cargo.toml";
import * as ImagePlugin from "tweakpane-image-plugin";

export interface IIngredientControl<T extends IngredientType> {
  attach(pane: Pane): void;
  detach(pane: Pane): void;

  emit(): any;
}

abstract class IngredientControl<T extends IngredientType>
  implements IIngredientControl<T>
{
  type: T;
  input: BladeApi<BladeController<View>>;
  abstract attach(pane: Pane);

  detach(pane: Pane) {
    pane.remove(this.input);
  }

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
    return { r: Math.round(this.r), g: Math.round(this.g), b: Math.round(this.b) };
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
