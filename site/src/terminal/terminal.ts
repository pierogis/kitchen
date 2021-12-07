export enum TerminalDirection {
  in = "in",
  out = "out",
}

export class Terminal {
  element: HTMLElement;
  direction: TerminalDirection;

  constructor(direction: TerminalDirection) {
    this.direction = direction;

    this.element = document.createElement("div");
    this.element.classList.add("terminal-" + this.direction);
  }

  expand() {
    this.element.classList.add("terminal-expand-" + this.direction);
  }

  contract() {
    this.element.classList.remove("terminal-expand-" + this.direction);
  }

  select() {
    this.element.classList.add("terminal-selected");
  }

  deselect() {
    console.log(this.element);
    this.element.classList.remove("terminal-selected");
  }
}
