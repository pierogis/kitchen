<script lang="ts">
	import type { Coordinates } from '$lib/state/stores/view';

	import { createEventDispatcher } from 'svelte';
	import { spring } from 'svelte/motion';
	import { derived, type Readable } from 'svelte/store';

	// define svelte sping animation effects

	export let cursorCoordinates: Readable<Coordinates>;
	const springCursorCoordinates = spring($cursorCoordinates, {
		stiffness: 0.2,
		damping: 0.65
	});

	cursorCoordinates.subscribe((currentCoordinates) => {
		$springCursorCoordinates = currentCoordinates;
	});

	const radius = 20;
	const size = spring(0);

	const touchDuration = 500;

	// this timer will fire a callback if you press long enough
	let longPressTimer: NodeJS.Timeout | null;

	let dispatch = createEventDispatcher();

	function handleMouseDown(event: MouseEvent) {
		// click
		if (!longPressTimer && event.button == 0) {
			size.set(radius);
			// send an event at end of timer
			longPressTimer = setTimeout(() => {
				size.set(0);
				// notify parent that there has been a long press
				dispatch('longpress', $cursorCoordinates);
			}, touchDuration);
		}
	}

	function handleMouseUp() {
		// nullify longpress timer from click
		size.set(0);
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
	}

	function followCursorAction(element: SVGSVGElement) {
		const svgPosition = derived(
			[springCursorCoordinates, size],
			([$springCursorCoordinates, $size]) => {
				const left = $springCursorCoordinates.x - $size + 'px';
				const top = $springCursorCoordinates.y - $size + 'px';

				return { left, top };
			}
		);
		svgPosition.subscribe((newPosition) => {
			element.style.left = newPosition.left;
			element.style.top = newPosition.top;
		});
	}
</script>

<svelte:window on:mouseup={handleMouseUp} on:mousedown={handleMouseDown} />

<svg use:followCursorAction width={$size > 0 ? $size * 2 : 0} height={$size > 0 ? $size * 2 : 0}>
	<circle cx={$size} cy={$size} r={$size > 0 ? $size : 0} />
</svg>

<style>
	svg {
		position: absolute;
		top: 0px;
		left: 0px;
	}
	circle {
		fill: hsla(0, 50%, 100%, 0.8);
		opacity: 30%;
		filter: blur(10px);
	}
</style>
