import type { Pane } from "tweakpane";
import { NodeState, RacksState, updateNode } from "../nodes/nodes";
import { viewportStore } from "../viewport/viewport";
import type { IngredientControl } from "./ingredients";
import { get, writable } from "svelte/store";
import { ParameterType } from "../connections/connections";

interface PlateProperties {
  width: number;
  height: number;
}

export class PlateControl implements IngredientControl<PlateProperties> {
  type = "plate";
  default(id: string, coords: { x: number; y: number }): NodeState {
    let defaultProperties = get(viewportStore);
    let defaultRacks: RacksState = { in: {}, out: {} };
    for (let propertyName in defaultProperties) {
      defaultRacks.in[propertyName] = {
        parameterType: ParameterType.number,
      };
      defaultRacks.out[propertyName] = {
        parameterType: ParameterType.number,
      };
    }

    return {
      nodeId: id,
      type: this.type,
      coords: writable(coords),
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

    let heightInput = pane
      .addInput(params, "height", {
        step: 1,
      })
      .on("change", (ev) => {
        node.properties.height = ev.value;
        updateNode(node);
      });

    return {
      width: widthInput,
      height: heightInput,
    };
  }
}
