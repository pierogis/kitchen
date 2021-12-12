import type { Pane } from "tweakpane";
import { NodeState, updateNode } from "../nodes/nodes";
import type { IngredientControl } from "./ingredients";

interface ColorProperties {
  r: number;
  g: number;
  b: number;
}

export class ColorControl implements IngredientControl {
  type = "color";
  attach(pane: Pane, node: NodeState, properties: ColorProperties) {
    const params = {
      color: {
        r: properties.r,
        g: properties.g,
        b: properties.b,
      },
    };
    let colorInput = pane.addInput(params, "color").on("change", (ev) => {
      node.properties.r = ev.value.r;
      node.properties.g = ev.value.g;
      node.properties.b = ev.value.b;
      updateNode(node);
    });

    return () => {
      colorInput.dispose();
    };
  }
}
