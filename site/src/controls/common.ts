import { BladeController } from "@tweakpane/core";
import { BladeApi, Pane } from "tweakpane";

import { IngredientType } from "../Cargo.toml";
import { Cable } from "../cable";

import { Terminal, TerminalDirection, TerminalRack } from "../terminal";

export interface View {
  readonly element: HTMLElement;
}

export abstract class NodeView implements View {
  public readonly element: HTMLElement;

  addTerminal(terminalRack: TerminalRack): Terminal {
    let terminal = new Terminal(terminalRack.terminalDirection);
    terminalRack.terminals.push(terminal);
    terminalRack.element.append(terminal.element);

    return terminal;
  }
}

export interface INodeControl {
  detach(pane: Pane): void;
}

export abstract class NodeControl implements INodeControl {
  view: NodeView;
  inputs: BladeApi<BladeController<View>>[];
  addTerminalCallback: (terminalRack: TerminalRack) => void;
  getMatchingTerminalsCallback: (terminal: Terminal) => Terminal[];

  constructor(addTerminalCallback: (terminalRack: TerminalRack) => void) {
    this.inputs = [];
    this.addTerminalCallback = addTerminalCallback;
  }

  detach(pane: Pane) {
    for (var input of this.inputs) {
      pane.remove(input);
    }
  }

  attachTerminalRack(
    target: HTMLElement,
    terminalDirection: TerminalDirection
  ) {
    let rack = new TerminalRack(
      target,
      terminalDirection,
      this.addTerminalCallback
    );
  }

  addTerminal(terminalRack: TerminalRack) {
    let terminal = this.view.addTerminal(terminalRack);
    this.addTerminalCallback(terminalRack);

    terminal.element.onmouseover = (ev: MouseEvent) => {
      terminal.select();

      terminal.element.onmousedown = (ev: MouseEvent) => {
        if (ev.button == 0) {
          terminal.element.onmouseleave = null;

          terminalRack.lockExpand();

          let terminalRect = terminal.element.getBoundingClientRect();
          let x1 = terminalRect.x + terminalRect.width / 2;
          let y1 = terminalRect.y + terminalRect.height / 2;
          let cable = new Cable(x1, y1);

          let release = () => {
            document.body.onmousemove = null;
            document.body.onmouseup = null;
            terminalRack.unlockExpand();
            terminalRack.contract();
          };

          document.body.onmousemove = (ev: MouseEvent) => {
            cable.draw(x1, y1, ev.clientX, ev.clientY);
          };

          let matchingTerminals = this.getMatchingTerminalsCallback(terminal);
          for (let matchingTerminal of matchingTerminals) {
            matchingTerminal.element.onmouseup = (ev: MouseEvent) => {
              console.log("connection");
              ev.preventDefault();
              release();
              matchingTerminal.element.onmouseleave = null;
              matchingTerminal.element.onmouseup = null;

              let terminalRect =
                matchingTerminal.element.getBoundingClientRect();
              let x2 = terminalRect.x + terminalRect.width / 2;
              let y2 = terminalRect.y + terminalRect.height / 2;

              cable.draw(x1, y1, x2, y2);
            };
          }

          document.body.onmouseup = (ev: MouseEvent) => {
            ev.preventDefault();
            for (let matchingTerminal of matchingTerminals) {
              matchingTerminal.element.onmouseup = null;
            }

            console.log;

            terminal.deselect();
            cable.dispose();
          };
        }
      };
    };

    terminal.element.onmouseleave = () => {
      console.log(terminal.element);
      terminal.deselect();
    };
  }
}

export interface IIngredientControl<T extends IngredientType>
  extends INodeControl {
  detach(pane: Pane): void;

  emit(): any;
}

export abstract class IngredientControl<T extends IngredientType>
  extends NodeControl
  implements IIngredientControl<T>
{
  type: T;

  abstract emit();
}
