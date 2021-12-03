import { Kitchen, Recipe, IngredientType } from "../Cargo.toml";
import { IngredientNode } from "./ingredientNode";

const canvas = document.createElement("canvas");
canvas.style.position = "fixed";
canvas.style.left = "0";
canvas.style.right = "0";
canvas.style.width = "100%";
canvas.style.height = "100%";
// canvas.width = window.width;
// canvas.height = window.;
document.body.appendChild(canvas);
let kitchen = new Kitchen(canvas);

const nodes: { [key: number]: IngredientNode } = {};

window.onresize = function () {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
};

function addNode(top: number, left: number) {
  let nodeId = currentNodeId;
  let node = new IngredientNode(IngredientType.Color, top, left, () =>
    deleteNode(nodeId)
  );
  nodes[nodeId] = node;
  currentNodeId++;
  node.render();
}

function deleteNode(nodeId: number) {
  nodes[nodeId].dispose();
  delete nodes[nodeId];
}

function gatherRecipe(): Recipe {
  let recipe = new Recipe();
  for (var key in nodes) {
    recipe.add(nodes[key].type, nodes[key].emit());
  }

  return recipe;
}
var onLongPress;
var timer;
var touchduration = 500; //length of time we want the user to touch before we do something

function pressStart(ev: MouseEvent) {
  ev.preventDefault();
  if (!timer) {
    timer = setTimeout(onLongPress, touchduration, ev);
  }
}

function pressEnd() {
  //stops short touches from firing the event
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

var currentNodeId = 0;

onLongPress = function (ev: MouseEvent) {
  timer = null;
  addNode(ev.clientY, ev.clientX);
};

canvas.onmousedown = pressStart;
canvas.onmouseup = pressEnd;

function render() {
  let recipe = gatherRecipe();
  kitchen.cook(recipe);
  window.requestAnimationFrame(render);
}
function init() {
  window.requestAnimationFrame(render);
}

init();
