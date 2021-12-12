import type { Pane } from "tweakpane";
import { NodeState, updateNode } from "../nodes/nodes";
import type { IngredientControl } from "./ingredients";

interface PlateProperties {
  width: number;
  height: number;
}

export class PlateControl implements IngredientControl {
  type = "plate";
  attach(pane: Pane, node: NodeState, properties: PlateProperties) {
    const params = {
      width: properties.width,
      height: properties.height,
    };
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
      widthInput.dispose();
      heightInput.dispose();
    };
  }
}
