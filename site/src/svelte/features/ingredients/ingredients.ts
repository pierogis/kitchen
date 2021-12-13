import { Writable, writable } from "svelte/store";
import type { Pane } from "tweakpane";
import type { NodeState, NodeProperties } from "../nodes/nodes";

import { PlateControl } from "./plate";
import { PierogiControl } from "./pierogi";
import { ColorControl } from "./color";

export interface IngredientControlHandle {
  inputs: { [key: string]: HTMLElement };
  detach();
}

export interface IngredientControl<P extends NodeProperties> {
  type: string;
  defaultProperties(): P;
  attach(pane: Pane, node: NodeState): IngredientControlHandle;
}

const initialState = {
  plate: new PlateControl(),
  pierogi: new PierogiControl(),
  color: new ColorControl(),
};

export const ingredientsStore: Writable<{
  [key: string]: IngredientControl<{}>;
}> = writable(initialState);

export function addIngredient(type: string, control: IngredientControl<any>) {
  ingredientsStore.update(($ingredients) => {
    $ingredients[type] = control;
    return $ingredients;
  });
}
export function updateIngredient(
  type: string,
  control: IngredientControl<any>
) {
  ingredientsStore.update(($ingredients) => {
    $ingredients[type] = control;
    return $ingredients;
  });
}
export function deleteIngredient(
  type: string,
  control: IngredientControl<any>
) {
  ingredientsStore.update(($ingredients) => {
    delete $ingredients[type];
    return $ingredients;
  });
}
