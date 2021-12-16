<script lang="typescript">
  import { createEventDispatcher } from "svelte";
  import { spring } from "svelte/motion";

  // define svelte sping animation effects
  let coords = { x: 0, y: 0 };
  let cursorLocation = spring(coords, {
    stiffness: 0.2,
    damping: 0.65,
  });

  let size = spring(0);

  const touchDuration = 500;

  // this timer will fire a callback if you press long enough
  var longPressTimer;

  let dispatch = createEventDispatcher();

  // follow the mouse
  function onmousemove(event: MouseEvent) {
    coords = { x: event.clientX, y: event.clientY };
  }

  function onmousedown(event: MouseEvent) {
    // click
    if (!longPressTimer && event.button == 0) {
      size.set(20);
      // send an event at end of timer
      longPressTimer = setTimeout(() => {
        size.set(0);
        // notify parent that there has been a long press
        dispatch("longpress", coords);
      }, touchDuration);
    }
  }

  function onmouseup() {
    // nullify longpress timer from click
    size.set(0);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  $: {
    cursorLocation.set(coords);
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
