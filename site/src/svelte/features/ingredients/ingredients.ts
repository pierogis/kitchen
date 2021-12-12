import { Writable, writable } from "svelte/store";
import type { Pane } from "tweakpane";
import type { NodeState } from "../nodes/nodes";

import { PlateControl } from "./plate";
import { PierogiControl } from "./pierogi";
import { ColorControl } from "./color";

export interface IngredientControl<P> {
  type: string;
  defaultProperties(): P;
  attach(pane: Pane, node: NodeState): () => void;
}

const initialState = {
  plate: new PlateControl(),
  pierogi: new PierogiControl(),
  color: new ColorControl(),
};

export const ingredientsStore: Writable<{
  [key: string]: IngredientControl<any>;
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
