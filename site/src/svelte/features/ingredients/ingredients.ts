import { Writable, writable } from "svelte/store";
import type { Pane } from "tweakpane";

export interface Ingredient {
  type: string;
  attach(pane: Pane);
  properties: {};
}

const initialState = {
  plate: {
    type: "plate",
    attach() {},
    properties: {},
  },
};

export const ingredientsStore: Writable<{ [key: string]: Ingredient }> =
  writable(initialState);

export function addIngredient(ingredient: Ingredient) {
  ingredientsStore.update(($ingredients) => {
    $ingredients[ingredient.type] = ingredient;
    return $ingredients;
  });
}
export function updateIngredient(ingredient: Ingredient) {
  ingredientsStore.update(($ingredients) => {
    $ingredients[ingredient.type] = ingredient;
    return $ingredients;
  });
}
export function deleteIngredient(ingredient: Ingredient) {
  ingredientsStore.update(($ingredients) => {
    delete $ingredients[ingredient.type];
    return $ingredients;
  });
}
