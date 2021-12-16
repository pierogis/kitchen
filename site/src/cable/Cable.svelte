<script lang="typescript">
  import { afterUpdate } from "svelte";

  import cssVars from "svelte-css-vars";

  export let x1, y1, x2, y2;

  let dragging = false;

  let svg: SVGElement;

  let left, top;

  let startY: number;
  let endY: number;

  $: width = Math.abs(x2 - x1);
  $: height = Math.abs(y2 - y1);

  // adjust svg position
  // there's a more concise way to do this
  // need to account for which side of the cable corresponds to left
  // 1st point is on left
  $: if (x1 < x2) {
    // will set left, top, startY, and height
    left = x1;

    // check if 1st point is above
    if (y1 < y2) {
      // top left is (0, 0) inside svg
      // going to bottom right (width, height)

      // absolute top on svg
      top = y1;
      // start y is the inside svg y coord at leftmost point
      startY = 0;
      // end y is the height down from start y (inside svg)
      endY = height;
    } else {
      // bottom left to top right
      top = y2;
      startY = height;
      endY = 0;
    }
  } else {
    left = x2;

    if (y1 < y2) {
      // bottom left to top right
      top = y1;
      startY = height;
      endY = 0;
    } else {
      //  top left to bottom right
      top = y2;
      startY = 0;
      endY = height;
    }
  }

  afterUpdate(() => {
    svg.style.left = left;
    svg.style.top = top;
  });

  // making bezier with 3 points (start, end, one at [x, y] middle)
  $: pathString = `M ${0} ${startY} C ${width / 2} ${startY}, ${
    width / 2
  } ${endY}, ${width} ${endY}`;

  const pathStrokeWidth = 4;

  $: styleVars = {
    pathStrokeWidth: pathStrokeWidth + "px",
  };
</script>

<svg bind:this={svg} use:cssVars={styleVars} {width} {height} class:dragging>
  <path d={pathString} />
</svg>

<style>
  .dragging {
    cursor: grabbing;
  }
  svg {
    position: absolute;
    padding: var(--pathStrokeWidth);
    margin: calc(0px - var(--pathStrokeWidth));
  }

  path {
    stroke: var(--close-color);
    stroke-width: var(--pathStrokeWidth);
    fill: transparent;
  }
</style>
