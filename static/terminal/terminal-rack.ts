import { Terminal, TerminalDirection } from "./terminal";

const nearTerminalRackDistance = 8;

export class TerminalRack {
  element: HTMLElement;
  terminals: Terminal[];
  terminalDirection: TerminalDirection;
  addTerminalCallback: (terminalRack: TerminalRack) => void;
  expandLocked: boolean = false;

  constructor(
    target: HTMLElement,
    terminalDirection: TerminalDirection,
    addTerminalCallback: (terminalRack: TerminalRack) => void
  ) {
    this.terminalDirection = terminalDirection;
    this.addTerminalCallback = addTerminalCallback;

    this.element = document.createElement("div");
    this.element.classList.add("terminal-rack-" + this.terminalDirection);

    this.terminals = [];

    this.terminalDirection = terminalDirection;
    this.addTerminalCallback(this);

    document.body.addEventListener("mousemove", (ev) => {
      if (!this.expandLocked) {
        let rackRect = this.element.getBoundingClientRect();
        var left = rackRect.left - nearTerminalRackDistance;
        var top = rackRect.top - nearTerminalRackDistance;
        var right = rackRect.right + nearTerminalRackDistance;
        var bottom = rackRect.bottom + nearTerminalRackDistance;
        var x = ev.pageX;
        var y = ev.pageY;
        let terminalGap = 4;
        let terminalWidth = 10;
        this.element.style.gap = terminalGap + "px";
        if (x > left && x < right && y > top && y < bottom) {
          this.expand(terminalGap, terminalWidth);
        } else {
          this.contract();
        }
      }
    });

    switch (this.terminalDirection) {
      case TerminalDirection.in: {
        target.prepend(this.element);
        break;
      }
      case TerminalDirection.out: {
        target.append(this.element);
        break;
      }
    }
  }

  expand(terminalGap: number, terminalWidth: number) {
    let width =
      terminalGap * (this.terminals.length + 1) +
      terminalWidth * this.terminals.length;
    switch (this.terminalDirection) {
      case TerminalDirection.in: {
        this.element.style.width = width + "px";
        this.element.style.marginRight = -width + "px";
        this.element.style.right = width + terminalWidth - terminalGap + "px";
        break;
      }
      case TerminalDirection.out: {
        this.element.style.width = width + "px";
        this.element.style.marginLeft = -width + "px";
        this.element.style.left = width + terminalWidth - terminalGap + "px";
        break;
      }
    }
    for (var terminal of this.terminals) {
      terminal.expand();
    }
  }

  contract() {
    this.element.style.width = "";
    this.element.style.marginRight = "";
    this.element.style.right = "";
    this.element.style.marginLeft = "";
    this.element.style.left = "";
    for (var terminal of this.terminals) {
      terminal.contract();
    }
  }

  lockExpand() {
    this.expandLocked = true;
  }

  unlockExpand() {
    this.expandLocked = false;
  }
}
