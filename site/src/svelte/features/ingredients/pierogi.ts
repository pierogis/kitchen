import { get } from "svelte/store";
import type { Pane } from "tweakpane";
import * as ImagePlugin from "tweakpane-image-plugin";

import { NodeState, updateNode } from "../nodes/nodes";
import { viewportStore } from "../viewport/viewport";
import type { IngredientControl } from "./ingredients";

interface PierogiProperties {
  image: HTMLImageElement;
  width: number;
  height: number;
}

export class PierogiControl implements IngredientControl<PierogiProperties> {
  type = "pierogi";
  defaultProperties(): PierogiProperties {
    return { ...get(viewportStore), image: new Image() };
  }
  attach(pane: Pane, node: NodeState) {
    pane.registerPlugin(ImagePlugin);

    const params = {
      image: node.properties.image,
      height: node.properties.height,
      width: node.properties.width,
    };

    let imageInput = pane
      .addInput(params, "image", {
        extensions: ".jpg, .png, .gif",
      })
      .on("change", (ev) => {
        node.properties.image = ev.value;
        updateNode(node);
      });

    let widthInput = pane
      .addInput(params, "width", {
        step: 1,
      })
      .on("change", (ev) => {
        node.properties.width = ev.value;
        updateNode(node);
      });

    // widthInput.controller_.view.element.prepend(widthInRack);
    // widthInput.controller_.view.element.append(widthOutRack);

    let heightInput = pane
      .addInput(params, "height", {
        step: 1,
      })
      .on("change", (ev) => {
        node.properties.height = ev.value;
        updateNode(node);
      });

    // heightInput.controller_.view.element.prepend(heightInRack);
    // heightInput.controller_.view.element.append(heightOutRack);

    return () => {
      imageInput.dispose();
      widthInput.dispose();
      heightInput.dispose();
    };
  }
  detach(pane: Pane) {
    // widthInput.dispose();
    // heightInput.dispose();
  }
}
