import { get } from "svelte/store";
import type { Pane } from "tweakpane";
import * as ImagePlugin from "tweakpane-image-plugin";
import { ConnectionInputType } from "../connections/connections";

import { NodeState, RacksState, updateNode } from "../nodes/nodes";
import { viewportStore } from "../viewport/viewport";
import type { IngredientControl } from "./ingredients";

interface PierogiProperties {
  image: HTMLImageElement;
  width: number;
  height: number;
}

export class PierogiControl implements IngredientControl<PierogiProperties> {
  type = "pierogi";
  default(id: string): NodeState {
    let defaultProperties = { ...get(viewportStore), image: new Image() };
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
    pane.registerPlugin(ImagePlugin);

    const params = {
      image: node.properties.image,
      height: node.properties.height,
      width: node.properties.width,
    };

    let imageInput = pane
      .addInput(params, "image", {
        extensions: ".jpg, .png, .gif",
      })
      .on("change", (ev) => {
        node.properties.image = ev.value;
        updateNode(node);
      });

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
      image: imageInput,
      width: widthInput,
      height: heightInput,
    };
  }
}
