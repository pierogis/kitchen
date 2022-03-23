import { Writable, writable } from "svelte/store";
import type { Pane } from "tweakpane";
import { ParameterType } from "../connections/connections";
import type { NodeParameters, NodeState } from "../nodes/nodes";
import { IngredientControl, IngredientControlHandle } from "./ingredients";

interface ColorParameters extends NodeParameters {
  color: {
    r: number;
    g: number;
    b: number;
  };
}

export class ColorControl extends IngredientControl<ColorParameters> {
  type = "color";

  default(
    id: string,
    coords: { x: number; y: number }
  ): NodeState<ColorParameters> {
    const defaultParameters = {
      color: {
        r: 120,
        g: 150,
        b: 190,
      },
    };
    const defaultRacks = {
      in: {},
      out: { color: { parameterType: ParameterType.color } },
    };

    return {
      nodeId: id,
      type: this.type,
      coords: writable(coords),
      parameters: writable(defaultParameters),
      racks: defaultRacks,
      dockedStatus: writable({ docked: false }),
    };
  }

  attach(
    pane: Pane,
    params: ColorParameters,
    store: Writable<ColorParameters>
  ): IngredientControlHandle {
    let colorInput = pane.addInput(params, "color").on("change", (ev) => {
      store.set({
        color: {
          r: ev.value.r,
          g: ev.value.g,
          b: ev.value.b,
        },
      });
    });

    return {
      color: colorInput,
    };
  }
}
