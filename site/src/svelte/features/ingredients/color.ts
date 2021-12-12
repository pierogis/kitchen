import type { Pane } from "tweakpane";
import { NodeState, updateNode } from "../nodes/nodes";
import type { IngredientControl } from "./ingredients";

interface ColorProperties {
  r: number;
  g: number;
  b: number;
}

export class ColorControl implements IngredientControl<ColorProperties> {
  type = "color";

  defaultProperties(): ColorProperties {
    return {
      r: 120,
      g: 150,
      b: 190,
    };
  }

  attach(pane: Pane, node: NodeState) {
    const params = {
      color: {
        r: node.properties.r,
        g: node.properties.g,
        b: node.properties.b,
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
