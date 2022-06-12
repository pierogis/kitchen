<script lang="ts">
	import type { Readable } from 'svelte/store';

	export let inCoords: Readable<{ x: number; y: number }>;
	export let outCoords: Readable<{ x: number; y: number }>;

	$: x1 = $inCoords.x;
	$: y1 = $inCoords.y;
	$: x2 = $outCoords.x;
	$: y2 = $outCoords.y;

	let dragging = false;

	let svg: SVGElement;

	let left: number, top: number;

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

	// making bezier with 4 points (start, [0, height/2], [width, height/2], end)
	$: pathString = `M ${0} ${startY} C ${0} ${height / 2}, ${width} ${height / 2}, ${width} ${endY}`;

	const pathStrokeWidth = 4;
</script>

{#if $inCoords.x && $inCoords.y && $outCoords.x && $outCoords.y}
	<svg
		bind:this={svg}
		style:--path-stroke-width="{pathStrokeWidth}px"
		style="width: {width}px; height: {height}px; left: {left}px; top: {top}px;"
		class:dragging
	>
		<path d={pathString} />
	</svg>
{/if}

<style>
	.dragging {
		cursor: grabbing;
	}
	svg {
		position: absolute;
		padding: var(--path-stroke-width);
		margin: calc(0px - var(--path-stroke-width));
	}

	path {
		stroke: var(--cable-color-number);
		opacity: 0.9;
		stroke-width: var(--path-stroke-width);
		fill: transparent;
	}
</style>
