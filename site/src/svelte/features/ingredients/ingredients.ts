import { Writable, writable } from "svelte/store";
import type { Pane } from "tweakpane";
import type { NodeState } from "../nodes/nodes";

import { PlateControl } from "./plate";
import { PierogiControl } from "./pierogi";
import { ColorControl } from "./color";

export interface IngredientControl {
  type: string;
  attach(pane: Pane, node: NodeState, properties: any): () => void;
}

const initialState = {
  plate: () => new PlateControl(),
  pierogi: () => new PierogiControl(),
  color: () => new ColorControl(),
};

export const ingredientsStore: Writable<{
  [key: string]: () => IngredientControl;
}> = writable(initialState);

export function addIngredient(type: string, control: () => IngredientControl) {
  ingredientsStore.update(($ingredients) => {
    $ingredients[type] = control;
    return $ingredients;
  });
}
export function updateIngredient(
  type: string,
  control: () => IngredientControl
) {
  ingredientsStore.update(($ingredients) => {
    $ingredients[type] = control;
    return $ingredients;
  });
}
export function deleteIngredient(
  type: string,
  control: () => IngredientControl
) {
  ingredientsStore.update(($ingredients) => {
    delete $ingredients[type];
    return $ingredients;
  });
}
