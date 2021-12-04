const nearTerminalRackDistance = 8;

export enum TerminalType {
  in = "in",
  out = "out",
}

export class TerminalRack {
  terminalRack: HTMLElement;
  terminals: HTMLElement[];

  addTerminal(terminalType: TerminalType) {
    let terminal = document.createElement("div");
    terminal.classList.add("terminal-" + terminalType);

    this.terminals.push(terminal);
    this.terminalRack.appendChild(terminal);
  }

  attach(target: HTMLElement, terminalType: TerminalType) {
    let terminalRack = document.createElement("div");
    terminalRack.classList.add("terminal-rack-" + terminalType);
    this.terminals = [];

    document.body.addEventListener("mousemove", (ev) => {
      let rackRect = terminalRack.getBoundingClientRect();
      var left = rackRect.left - nearTerminalRackDistance;
      var top = rackRect.top - nearTerminalRackDistance;
      var right = rackRect.right + nearTerminalRackDistance;
      var bottom = rackRect.bottom + nearTerminalRackDistance;
      var x = ev.pageX;
      var y = ev.pageY;
      let terminalGap = 4;
      let terminalWidth = 10;
      terminalRack.style.gap = terminalGap + "px";
      if (x > left && x < right && y > top && y < bottom) {
        let width =
          terminalGap * (this.terminals.length + 1) +
          terminalWidth * this.terminals.length;
        switch (terminalType) {
          case TerminalType.in: {
            terminalRack.style.width = width + "px";
            terminalRack.style.marginRight = -width + "px";
            terminalRack.style.right =
              width + terminalWidth - terminalGap + "px";
            break;
          }
          case TerminalType.out: {
            terminalRack.style.width = width + "px";
            terminalRack.style.marginLeft = -width + "px";
            terminalRack.style.left =
              width + terminalWidth - terminalGap + "px";
            break;
          }
        }
        for (var terminal of this.terminals) {
          terminal.classList.add("terminal-expand-" + terminalType);
        }
      } else {
        terminalRack.style.width = "";
        terminalRack.style.marginRight = "";
        terminalRack.style.right = "";
        terminalRack.style.marginLeft = "";
        terminalRack.style.left = "";
        for (var terminal of this.terminals) {
          terminal.classList.remove("terminal-expand-" + terminalType);
        }
      }
    });

    this.terminalRack = terminalRack;
    this.addTerminal(terminalType);

    switch (terminalType) {
      case TerminalType.in: {
        target.prepend(this.terminalRack);
        break;
      }
      case TerminalType.out: {
        target.append(this.terminalRack);
      }
    }
  }
}
