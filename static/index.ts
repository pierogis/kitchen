import { Pane } from "tweakpane";

import { Kitchen, Recipe, IngredientType } from "../Cargo.toml";

import { PlateControl } from "./controls/plate-control";
import { IngredientNode } from "./ingredientNode";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const nodes: { [key: number]: IngredientNode } = {};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let viewportWidth = canvas.width;
let viewportHeight = canvas.height;

window.onresize = (ev: UIEvent) => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  centerVewport();
};

let kitchen = new Kitchen(canvas);

function centerVewport() {
  let gl = canvas.getContext("webgl");
  let left = (canvas.width - viewportWidth) / 2;
  let top = (canvas.height - viewportHeight) / 2;
  gl.viewport(left, top, viewportWidth, viewportHeight);
}

let plateControl = new PlateControl(
  viewportWidth,
  viewportHeight,
  (width, height) => {
    viewportWidth = width;
    viewportHeight = height;
    centerVewport();
  }
);

function onScroll() {
  window.scrollTo(0, 0);
}

window.onscroll = () => onScroll;

let plateNode = document.createElement("div");
plateNode.classList.add("plate-node");
plateNode.classList.add("no-select");

document.body.append(plateNode)

let platePane = new Pane({ container: plateNode });

plateControl.attach(platePane);

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

let cursorCircle = document.createElement("div");
cursorCircle.classList.add("cursor-circle");

var onLongPress;
var longPressTimer;
var moveCancelsTimer;
var touchduration = 500; //length of time we want the user to touch before we do something

cursorCircle.style.transition = `width ${touchduration / 1.5}ms, height ${
  touchduration / 1.5
}ms, margin ${touchduration / 1.5}ms`;
document.body.append(cursorCircle);

document.addEventListener("mousemove", (ev) => {
  moveCursorCircle(ev);
});

function moveCursorCircle(ev: MouseEvent) {
  cursorCircle.style.left = ev.clientX + "px";
  cursorCircle.style.top = ev.clientY + "px";
}

function pressStart(ev: MouseEvent | Touch) {
  cursorCircle.style.width = "20px";
  cursorCircle.style.height = "20px";
  cursorCircle.style.marginTop = "-10px";
  cursorCircle.style.marginLeft = "-10px";
  if (!moveCancelsTimer) {
    moveCancelsTimer = setTimeout(() => {
      canvas.onmousemove = pressEnd;
    }, 300);
  }
  if (!longPressTimer) {
    longPressTimer = setTimeout(onLongPress, touchduration, ev);
  }
}

function pressEnd() {
  cursorCircle.style.width = "0px";
  cursorCircle.style.height = "0px";
  cursorCircle.style.marginTop = "0px";
  cursorCircle.style.marginLeft = "0px";
  if (moveCancelsTimer) {
    canvas.onmousemove = null;
    clearTimeout(moveCancelsTimer);
    moveCancelsTimer = null;
  }
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

var currentNodeId = 0;

onLongPress = function (ev: MouseEvent | Touch) {
  if (moveCancelsTimer) {
    canvas.onmousemove = null;
    clearTimeout(moveCancelsTimer);
    moveCancelsTimer = null;
  }
  longPressTimer = null;
  cursorCircle.style.width = "0px";
  cursorCircle.style.height = "0px";
  cursorCircle.style.marginTop = "0px";
  cursorCircle.style.marginLeft = "0px";
  addNode(ev.clientY, ev.clientX);
};

canvas.onmousedown = (ev) => {
  if (ev.button == 0) {
    ev.preventDefault();
    pressStart(ev);
  }
};
canvas.onmouseup = pressEnd;

canvas.ontouchstart = (ev) => {
  ev.preventDefault();
  pressStart(ev.touches.item(0));
};
canvas.ontouchcancel = pressEnd;

function render() {
  let recipe = gatherRecipe();
  kitchen.cook(recipe);
  window.requestAnimationFrame(render);
}
function init() {
  window.requestAnimationFrame(render);
}

init();
