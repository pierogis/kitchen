<script lang="ts">
	import { spring } from 'svelte/motion';
	import { derived } from 'svelte/store';

	import type { Coordinates } from '$types';

	// define sping animation effects
	export let cursorCoordinates: Coordinates;
	export let pressing: boolean;

	const springCursorCoordinates = spring(cursorCoordinates, {
		stiffness: 0.2,
		damping: 0.65
	});

	$: $springCursorCoordinates = cursorCoordinates;

	const radius = 10;
	const size = spring(0);
	$: pressing ? size.set(radius) : size.set(0);

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

<svg use:followCursorAction width={$size > 0 ? $size * 2 : 0} height={$size > 0 ? $size * 2 : 0}>
	<circle cx={$size} cy={$size} r={$size > 0 ? $size : 0} />
</svg>

<style>
	svg {
		position: absolute;
		pointer-events: none;
	}
	circle {
		fill: hsla(0, 50%, 100%, 0.3);
		opacity: 30%;
		filter: blur(1000px);
	}
</style>
