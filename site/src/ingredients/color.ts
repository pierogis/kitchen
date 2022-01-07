import type { Pane } from "tweakpane";
import { ConnectionInputType } from "../connections/connections";
import { NodeProperties, NodeState, updateNode } from "../nodes/nodes";
import type { IngredientControl } from "./ingredients";

interface ColorProperties extends NodeProperties {
  r: number;
  g: number;
  b: number;
}

export class ColorControl implements IngredientControl<ColorProperties> {
  type = "color";

  default(id: string): NodeState {
    const defaultProperties = {
      r: 120,
      g: 150,
      b: 190,
    };
    const defaultRacks = {
      in: { color: { inputType: ConnectionInputType.color } },
      out: { color: { inputType: ConnectionInputType.color } },
    };

    return {
      nodeId: id,
      type: this.type,
      style: "",
      properties: defaultProperties,
      racks: defaultRacks,
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

    return {
      color: colorInput,
    };
  }
}
