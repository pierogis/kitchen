import { Writable, writable } from "svelte/store";
import type { BladeApi, Pane } from "tweakpane";
import type { NodeState, NodeParameters } from "../nodes/nodes";

import type { LabelController } from "@tweakpane/core";

export type IngredientControlHandle = {
  [parameterName: string]: BladeApi<LabelController<any>>;
};

interface IIngredientControl<P extends NodeParameters> {
  type: string;
  default(
    id: string,
    coords: {
      x: number;
      y: number;
    }
  ): NodeState<P>;
  attach(pane: Pane, params: P, store: Writable<P>): IngredientControlHandle;
}

export abstract class IngredientControl<P> implements IIngredientControl<P> {
  type: string;

  abstract default(
    id: string,
    coords: {
      x: number;
      y: number;
    }
  ): NodeState<P>;

  subscribe(pane: Pane, store: Writable<P>, params: P) {
    store.subscribe((parameters) => {
      Object.entries(parameters).forEach(([name, value]) => {
        params[name] = value;
      });

      pane.refresh();
    });
  }

  abstract attach(
    pane: Pane,
    params: P,
    store: Writable<P>
  ): IngredientControlHandle;
}

export const ingredientsStore: Writable<{
  [ingredientName: string]: IngredientControl<{}>;
}> = writable({});

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
