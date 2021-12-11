import { Pane } from "tweakpane";

import { Kitchen, Recipe, IngredientType } from "../Cargo.toml";
import { Cable } from "./cableimport { PlateControl } from "./raw/controls/plate-controltrol";
import { IngredientNode } from "./raw/ingred./ingredientNode Terminal } from "./raw/terminal";

ex./terminaltaurant {
  canvas: HTMLCanvasElement;
  viewportWidth: number;
  viewportHeight: number;
  currentNodeId: number = 0;
  nodes: { [key: number]: IngredientNode };
  kitchen: Kitchen;

  terminals: Terminal[];

  constructor() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);

    this.nodes = {};
    this.terminals = [];

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;

    window.onresize = (ev: UIEvent) => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      centerViewport(this.canvas, this.viewportWidth, this.viewportHeight);
    };

    this.kitchen = new Kitchen(this.canvas);

    let plateNode = document.createElement("div");
    plateNode.classList.add("plate-node");
    plateNode.classList.add("no-select");

    document.body.append(plateNode);

    let platePane = new Pane({ container: plateNode });
    let plateControl = new PlateControl(
      platePane,
      this.viewportWidth,
      this.viewportHeight,
      (width, height) => {
        this.viewportWidth = width;
        this.viewportHeight = height;
        centerViewport(this.canvas, width, height);
      },
      (terminal: Terminal) => this.addTerminal(terminal)
    );

    window.requestAnimationFrame(() => this.render());
  }

  addNode(top: number, left: number) {
    let nodeId = this.currentNodeId;
    let node = new IngredientNode(
      IngredientType.Color,
      top,
      left,
      () => this.deleteNode(nodeId),
      (terminal: Terminal) => this.terminals.push(terminal),
      (terminal: Terminal) => this.getMatchingTerminals(terminal)
    );

    this.nodes[nodeId] = node;
    this.currentNodeId++;
  }

  deleteNode(nodeId: number) {
    this.nodes[nodeId].dispose();
    delete this.nodes[nodeId];
  }

  getMatchingTerminals(terminal: Terminal): Terminal[] {
    let matches = [];
    for (var candidate of this.terminals) {
      if (terminal.direction != candidate.direction) matches.push(candidate);
    }
    return matches;
  }

  gatherRecipe(): Recipe {
    let recipe = new Recipe();
    for (var key in this.nodes) {
      recipe.add(this.nodes[key].ingredientType, this.nodes[key].emit());
    }

    return recipe;
  }

  render() {
    let recipe = this.gatherRecipe();
    this.kitchen.cook(recipe);
    window.requestAnimationFrame(() => this.render());
  }
}
function centerViewport(
  canvas: HTMLCanvasElement,
  viewportWidth: number,
  viewportHeight: number
) {
  let gl = canvas.getContext("webgl");
  let left = (canvas.width - viewportWidth) / 2;
  let top = (canvas.height - viewportHeight) / 2;
  gl.viewport(left, top, viewportWidth, viewportHeight);
}
