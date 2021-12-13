import type { Pane } from "tweakpane";
import { NodeState, updateNode } from "../nodes/nodes";
import { viewportStore } from "../viewport/viewport";
import type { IngredientControl } from "./ingredients";
import { get } from "svelte/store";

interface PlateProperties {
  width: number;
  height: number;
}

export class PlateControl implements IngredientControl<PlateProperties> {
  type = "plate";
  defaultProperties(): PlateProperties {
    return get(viewportStore);
  }
  attach(pane: Pane, node: NodeState) {
    const params = {
      width: node.properties.width,
      height: node.properties.height,
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

    return {
      inputs: {
        width: widthInput.controller_.view.element,
        height: heightInput.controller_.view.element,
      },
      detach: () => {
        widthInput.dispose();
        heightInput.dispose();
      },
    };
  }
}
