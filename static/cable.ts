export class Cable {
  start: HTMLElement;
  end: HTMLElement;

  svg: SVGSVGElement;
  path: SVGPathElement;

  constructor(base: HTMLElement) {
    this.start = base;

    this.svg = this.createSvg();
    document.body.appendChild(this.svg);

    this.path = this.createPath();
    this.svg.appendChild(this.path);
  }

  createSvg(): SVGSVGElement {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("cable");
    return svg;
  }

  createPath(): SVGPathElement {
    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.classList.add("cable");
    return path;
  }

  draw(x1: number, y1: number, x2: number, y2: number) {
    let xMidpoint = (x1 + x2) / 2;

    let width = Math.abs(x2 - x1);
    let height = Math.abs(y2 - y1);

    let startY: number;
    let endY: number;
    // adjust svg position
    if (x1 < x2) {
      this.svg.style.left = x1 + "px";

      if (y1 < y2) {
        this.svg.style.top = y1 + "px";
        startY = 0;
        endY = height;
      } else {
        this.svg.style.top = y2 + "px";
        startY = height;
        endY = 0;
      }
    } else {
      this.svg.style.left = x2 + "px";

      if (y1 < y2) {
        this.svg.style.top = y1 + "px";
        startY = height;
        endY = 0;
      } else {
        this.svg.style.top = y2 + "px";
        startY = 0;
        endY = height;
      }
    }

    let pathString = `M ${0} ${startY} C ${width / 2} ${startY}, ${
      width / 2
    } ${endY}, ${width} ${endY}`;

    console.log(x1, x2, y1, y2);
    this.svg.style.width = width + "px";
    this.svg.style.height = Math.abs(y2 - y1) + "px";

    this.path.setAttributeNS(null, "d", pathString);
  }

  dispose() {
    this.svg.remove();
  }
}
