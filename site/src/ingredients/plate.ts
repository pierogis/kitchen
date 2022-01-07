import type { Pane } from "tweakpane";
import { NodeState, RacksState, updateNode } from "../nodes/nodes";
import { viewportStore } from "../viewport/viewport";
import type { IngredientControl } from "./ingredients";
import { get } from "svelte/store";
import { ConnectionInputType } from "../connections/connections";

interface PlateProperties {
  width: number;
  height: number;
}

export class PlateControl implements IngredientControl<PlateProperties> {
  type = "plate";
  default(id: string): NodeState {
    let defaultProperties = get(viewportStore);
    let defaultRacks: RacksState = { in: {}, out: {} };
    for (let propertyName in defaultProperties) {
      defaultRacks.in[propertyName] = {
        inputType: ConnectionInputType.number,
      };
      defaultRacks.out[propertyName] = {
        inputType: ConnectionInputType.number,
      };
    }

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
      width: widthInput,
      height: heightInput,
    };
  }
}
