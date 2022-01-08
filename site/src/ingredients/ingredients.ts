import { Writable, writable } from "svelte/store";
import type { InputBindingApi, Pane } from "tweakpane";
import type { NodeState, NodeProperties } from "../nodes/nodes";

import { PlateControl } from "./plate";
import { PierogiControl } from "./pierogi";
import { ColorControl } from "./color";

export type IngredientControlHandle = {
  [parameterName: string]: InputBindingApi<unknown, any>;
};

export interface IngredientControl<P extends NodeProperties> {
  type: string;
  default(id: string): NodeState;
  attach(pane: Pane, node: NodeState): IngredientControlHandle;
}

const initialState = {
  plate: new PlateControl(),
  pierogi: new PierogiControl(),
  color: new ColorControl(),
};

export const ingredientsStore: Writable<{
  [ingredientName: string]: IngredientControl<{}>;
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
