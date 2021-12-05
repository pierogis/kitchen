import { Pane } from "tweakpane";

import { IngredientType } from "../Cargo.toml";
import { Cable } from "./cable";
import { ColorControl, PierogiControl, IIngredientControl } from "./controls";
import { TerminalRack, Terminal } from "./terminal";
import { View, NodeView } from "./controls";

const ingredientTypeMap = {
  color: IngredientType.Color,
  pierogi: IngredientType.Pierogi,
};

class IngredientNodeView {
  element: HTMLElement;
  pane: Pane;
  top: number;
  left: number;
  closeCallback: () => void;
  getMatchingTerminalsCallback: (Terminal) => Terminal[];

  constructor(
    ingredientType: IngredientType,
    top: number,
    left: number,
    closeCallback: () => void
  ) {
    this.top = top;
    this.left = left;
    this.closeCallback = closeCallback;

    let element = document.createElement("div");
    element.classList.add("ingredient-node");
    element.classList.add("no-select");
    element.style.top = this.top - 10 + "px";
    element.style.left = this.left - 100 + "px";

    let header = document.createElement("div");
    header.classList.add("node-header");
    element.appendChild(header);

    let grabButton = document.createElement("div");
    grabButton.classList.add("grab");

    let grabDot = document.createElement("div");
    grabDot.classList.add("grab-dot");

    grabButton.appendChild(grabDot);
    grabButton.appendChild(grabDot.cloneNode());

    let closeButton = document.createElement("div");
    closeButton.classList.add("close");

    header.appendChild(grabButton);
    header.appendChild(closeButton);

    this.makeDraggable(grabButton, element);
    this.makeClosable(closeButton);

    const pane = new Pane({
      container: element,
    });
    this.pane = pane;

    document.body.appendChild(element);

    this.element = element;
  }

  private makeDraggable(target: HTMLElement, draggable: HTMLElement) {
    var pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;

    target.onmousedown = dragMouseDown;
    function dragMouseDown(e: MouseEvent) {
      e.preventDefault();
      target.classList.add("dragging");
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e: MouseEvent) {
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      let top = draggable.offsetTop - pos2;
      let left = draggable.offsetLeft - pos1;
      this.top = top;
      this.left = left;
      draggable.style.top = top + "px";
      draggable.style.left = left + "px";
    }

    function closeDragElement() {
      // stop moving when mouse button is released:
      target.classList.remove("dragging");
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  private makeClosable(target: HTMLElement) {
    target.onclick = (e: MouseEvent) => {
      e.preventDefault();
      this.closeCallback();
    };
  }
}

export class IngredientNode {
  ingredientType: IngredientType;
  view: IngredientNodeView;
  top: number;
  left: number;
  control: IIngredientControl<IngredientType>;
  closeCallback: () => void;
  addTerminalCallback: (terminal: Terminal) => void;
  getMatchingTerminalsCallback: (terminal: Terminal) => Terminal[];

  constructor(
    ingredientType: IngredientType,
    top: number,
    left: number,
    closeCallback: () => void,
    addTerminalCallback: (terminal: Terminal) => void,
    getMatchingTerminalsCallback: (terminal: Terminal) => Terminal[]
  ) {
    this.ingredientType = ingredientType;
    this.top = top;
    this.left = left;
    this.closeCallback = closeCallback;
    this.addTerminalCallback = addTerminalCallback;
    this.getMatchingTerminalsCallback = getMatchingTerminalsCallback;

    this.view = new IngredientNodeView(
      ingredientType,
      top,
      left,
      closeCallback
    );

    this.attachBaseInput();
    this.attachInput(ingredientType);
  }

  dispose() {
    this.view.element.remove();
  }

  attachBaseInput(): void {
    // pane.registerPlugin(TweakpaneSearchListPlugin);
    this.view.pane
      .addInput({ type: this.ingredientType }, "type", {
        view: "search-list",
        options: ingredientTypeMap,
      })
      .on("change", (ev) => {
        this.changeType(ev.value);
      });
  }

  attachInput(type: IngredientType): void {
    let control: IIngredientControl<IngredientType>;
    switch (type) {
      case IngredientType.Color: {
        control = new ColorControl(this.view.pane, () => this.addTerminal);
        break;
      }
      case IngredientType.Pierogi: {
        control = new PierogiControl(this.view.pane, () => this.addTerminal);
        break;
      }
    }

    this.control = control;
  }

  changeType(ingredientType: IngredientType) {
    if (ingredientType == this.ingredientType) return;
    this.control.detach(this.view.pane);
    this.ingredientType = ingredientType;
    this.attachInput(ingredientType);
  }

  emit() {
    return this.control.emit();
  }
}
