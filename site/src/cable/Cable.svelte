<script lang="typescript">
  import cssVars from "svelte-css-vars";

  export let x1, y1, x2, y2;

  console.log(x1, y1, x2, y2)

  $: width = Math.abs(x2 - x1);
  $: height = Math.abs(y2 - y1);

  let left, top;

  let startY: number;
  let endY: number;

  // adjust svg position
  $: if (x1 < x2) {
    left = x1;

    if (y1 < y2) {
      top = y1;
      startY = 0;
      endY = height;
    } else {
      top = y2;
      startY = height;
      endY = 0;
    }
  } else {
    left = x2;

    if (y1 < y2) {
      top = y1;
      startY = height;
      endY = 0;
    } else {
      top = y2;
      startY = 0;
      endY = height;
    }
  }

  $: pathString = `M ${0} ${startY} C ${width / 2} ${startY}, ${
    width / 2
  } ${endY}, ${width} ${endY}`;

  let dragging = false;

  const pathStrokeWidth = 4;

  $: styleVars = {
    left: left + "px",
    top: top + "px",
    pathStrokeWidth: pathStrokeWidth + "px",
  };
</script>

<svg use:cssVars={styleVars} {width} {height} class:dragging>
  <path d={pathString} />
</svg>

<style>
  .dragging {
    cursor: grabbing;
  }
  svg {
    position: absolute;
    left: var(--left);
    top: var(--top);
    padding: var(--pathStrokeWidth);
    margin: calc(0px - var(--pathStrokeWidth));
  }

  path {
    stroke: var(--close-color);
    stroke-width: var(--pathStrokeWidth);
    fill: transparent;
  }
</style>
