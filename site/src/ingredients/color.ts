import { writable } from "svelte/store";
import type { Pane } from "tweakpane";
import { ParameterType } from "../connections/connections";
import { NodeProperties, NodeState, updateNode } from "../nodes/nodes";
import type { IngredientControl, IngredientControlHandle } from "./ingredients";

interface ColorProperties extends NodeProperties {
  r: number;
  g: number;
  b: number;
}

export class ColorControl implements IngredientControl<ColorProperties> {
  type = "color";

  default(id: string, coords: { x: number; y: number }): NodeState {
    const defaultProperties = {
      r: 120,
      g: 150,
      b: 190,
    };
    const defaultRacks = {
      in: {},
      out: { color: { parameterType: ParameterType.color } },
    };

    return {
      nodeId: id,
      type: this.type,
      coords: writable(coords),
      properties: defaultProperties,
      racks: defaultRacks,
    };
  }

  attach(pane: Pane, node: NodeState): IngredientControlHandle {
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

    const parameterInputs = {
      color: colorInput,
    };

    // // look for connection with this node, parameter name as "in"
    // derived(connectionsStore, (connections) => {
    //   const inConnection = Object.entries(connections).find(
    //     ([connectionId, connection]) =>
    //       connection.in.nodeId == node.nodeId &&
    //       connection.in.parameterName == "color"
    //   );

    //   if (inConnection) {
    //     const valueStore = connection.valueStore;

    //     pane.remove(colorInput);
    //     let monitor = pane.addMonitor(connection.valueStore);
    //   }
    // });
    // node.racks.in["color"];

    return parameterInputs;
  }
}
