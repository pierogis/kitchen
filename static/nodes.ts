import { BladeController, View } from "@tweakpane/core";
import { BladeApi, Pane } from "tweakpane";
import * as ImagePlugin from "tweakpane-image-plugin";
// import { Ingredient } from "../Cargo.toml";

export enum Ingredients {
  color = "color",
  pierogi = "pierogi",
}

export class IngredientNode {
  type: Ingredients;
  top: number;
  left: number;
  pane: Pane;
  control: IIngredientControl<Ingredients>;
  closeCallback: () => void;

  container: HTMLElement;

  constructor(
    type: Ingredients,
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
    pane
      .addInput({ type: this.type }, "type", {
        view: "search-list",
        options: {
          color: "color",
          pierogi: "pierogi",
        },
      })
      .on("change", (ev) => {
        let type: Ingredients = <Ingredients>ev.value;
        this.changeType(type);
      });
  }
  attachInput(pane: Pane, type: Ingredients): void {
    let control: IIngredientControl<Ingredients>;

    switch (type) {
      case Ingredients.color: {
        control = new ColorControl();
        control.attach(pane);
        break;
      }
      case Ingredients.pierogi: {
        control = new PierogiControl();
        control.attach(pane);
        break;
      }
    }

    this.control = control;
  }

  changeType(type: Ingredients) {
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

interface IIngredientControl<T extends Ingredients> {
  attach(pane: Pane): void;
  detach(pane: Pane): void;

  emit(): any;
}

abstract class IngredientControl<T extends Ingredients>
  implements IIngredientControl<T>
{
  type: T;
  input: BladeApi<BladeController<View>>;
  abstract attach(pane: Pane);

  detach(pane: Pane) {
    pane.remove(this.input);
  }

  abstract emit();
}

class ColorControl extends IngredientControl<Ingredients.color> {
  type: Ingredients.color;
  r: number;
  g: number;
  b: number;

  constructor() {
    super();
    this.r = 120;
    this.g = 150;
    this.b = 190;
  }

  attach(pane: Pane) {
    this.input = pane
      .addInput({ color: { r: this.r, g: this.g, b: this.b } }, "color")
      .on("change", (ev) => {
        this.r = ev.value.r;
        this.g = ev.value.g;
        this.b = ev.value.b;
      });
  }

  emit() {
    return { r: this.r, g: this.g, b: this.b };
  }
}

class PierogiControl extends IngredientControl<Ingredients.pierogi> {
  type: Ingredients.pierogi;
  image: string;

  attach(pane: Pane) {
    pane.registerPlugin(ImagePlugin);

    const params = {
      image: new Image(),
    };

    this.input = pane
      .addInput(params, "image", {
        extensions: ".jpg, .gif",
      })
      .on("change", (ev) => {
        console.log(ev.value);
      });
  }

  emit() {
    return { image: this.image };
  }
}
