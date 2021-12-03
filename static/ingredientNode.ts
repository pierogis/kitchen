import { Pane } from "tweakpane";
import { INodeControl, ColorControl, PierogiControl, IIngredientControl } from "./controls";
import TweakpaneSearchListPlugin from "tweakpane-plugin-search-list";
import { IngredientType } from "../Cargo.toml";
import { EBADF } from "constants";

// export enum IngredientType {
//   Color = "color",
//   Pierogi = "pierogi",
// }

const ingredientTypeMap = {
  "color": IngredientType.Color,
  "pierogi": IngredientType.Pierogi
}

export class IngredientNode {
  type: IngredientType;
  top: number;
  left: number;
  pane: Pane;
  control: IIngredientControl<IngredientType>;
  closeCallback: () => void;

  container: HTMLElement;

  constructor(
    type: IngredientType,
    top: number,
    left: number,
    closeCallback: () => void
  ) {
    this.type = type;
    this.top = top;
    this.left = left;
    this.closeCallback = closeCallback;
  }

  render() {
    let container = document.createElement("div");
    container.classList.add("node");
    container.classList.add("no-select");
    container.style.top = this.top - 10 + "px";
    container.style.left = this.left - 100 + "px";

    let header = document.createElement("div");
    header.classList.add("node-header");
    container.appendChild(header);

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

    this.makeDraggable(grabButton, container);
    this.makeClosable(closeButton);

    const pane = new Pane({
      container: container,
    });
    this.pane = pane;

    this.attachBaseInput(pane);
    this.attachInput(pane, this.type);

    document.body.appendChild(container);

    this.container = container;
  }

  dispose() {
    this.container.remove();
  }

  attachBaseInput(pane: Pane): void {
    // pane.registerPlugin(TweakpaneSearchListPlugin);
    pane
      .addInput({ type: this.type }, "type", {
        view: "search-list",
        options: ingredientTypeMap,
      })
      .on("change", (ev) => {
        this.changeType(ev.value);
      });
  }
  attachInput(pane: Pane, type: IngredientType): void {
    let control: IIngredientControl<IngredientType>;
    switch (type) {
      case IngredientType.Color: {
        control = new ColorControl();
        control.attach(pane);
        break;
      }
      case IngredientType.Pierogi: {
        control = new PierogiControl();
        control.attach(pane);
        break;
      }
    }

    this.control = control;
  }

  changeType(type: IngredientType) {
    if (type == this.type) return;
    this.control.detach(this.pane);
    this.type = type;
    this.attachInput(this.pane, type);
  }

  emit() {
    return this.control.emit();
  }

  makeDraggable(target: HTMLElement, draggable: HTMLElement) {
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

  makeClosable(target: HTMLElement) {
    target.onclick = (e: MouseEvent) => {
      e.preventDefault();
      this.closeCallback();
    };
  }
}
