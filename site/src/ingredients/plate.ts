import type { Pane } from "tweakpane";
import type { NodeParameters, NodeState, RacksState } from "../nodes/nodes";
import { viewportStore } from "../viewport/viewport";
import { IngredientControl } from "./ingredients";
import { get, Writable, writable } from "svelte/store";
import { ParameterType } from "../connections/connections";

interface PlateParameters extends NodeParameters {
  width: number;
  height: number;
}

export class PlateControl extends IngredientControl<PlateParameters> {
  type = "plate";
  default(
    id: string,
    coords: { x: number; y: number }
  ): NodeState<PlateParameters> {
    let defaultParameters = get(viewportStore);
    let defaultRacks: RacksState = { in: {}, out: {} };
    for (let propertyName in defaultParameters) {
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
      parameters: writable(defaultParameters),
      racks: defaultRacks,
    };
  }
  attach(
    pane: Pane,
    params: PlateParameters,
    store: Writable<PlateParameters>
  ) {
    let widthInput = pane
      .addInput(params, "width", {
        step: 1,
      })
      .on("change", (ev) => {
        store.update((old) => {
          old.width = ev.value;
          return old;
        });
      });

    let heightInput = pane
      .addInput(params, "height", {
        step: 1,
      })
      .on("change", (ev) => {
        store.update((old) => {
          old.height = ev.value;
          return old;
        });
      });

    return {
      width: widthInput,
      height: heightInput,
    };
  }
}
