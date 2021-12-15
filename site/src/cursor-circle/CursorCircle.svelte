<script lang="typescript">
  import { createEventDispatcher } from "svelte";
  import { spring } from "svelte/motion";

  let coords = { x: 0, y: 0 };
  let cursorLocation = spring(coords, {
    stiffness: 0.2,
    damping: 0.65,
  });

  $: {
    cursorLocation.set(coords);
  }

  let size = spring(0);

  let touchDuration = 500;

  var longPressTimer;

  let dispatch = createEventDispatcher();

  function onmousemove(event: MouseEvent) {
    coords = { x: event.clientX, y: event.clientY };
  }

  function onmousedown(event: MouseEvent) {
    if (!longPressTimer && event.button == 0) {
      size.set(20);
      longPressTimer = setTimeout(() => {
        size.set(0);
        dispatch("longpress", coords);
      }, touchDuration);
    }
  }

  function onmouseup() {
    size.set(0);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }
</script>

<svg
  on:mousemove={onmousemove}
  on:mousedown={onmousedown}
  on:mouseup={onmouseup}
>
  <circle cx={$cursorLocation.x} cy={$cursorLocation.y} r={$size} />
</svg>

<style>
  svg {
    position: absolute;
    width: 100%;
    height: 100%;

    top: 0;
    left: 0;
  }
  circle {
    fill: hsla(0, 0%, 100%, 0.3);
    opacity: 30%;
    filter: blur(10px);
  }
</style>
