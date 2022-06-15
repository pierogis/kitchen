<script lang="ts">
	import type { Coordinates } from '$lib/state/stores/view';

	import { derived, type Readable } from 'svelte/store';

	export let inCoordinates: Readable<Coordinates>;
	export let outCoordinates: Readable<Coordinates>;

	let dragging = false;

	let left: number, top: number;

	let startY: number;
	let endY: number;

	const pathDescriptor = derived(
		[inCoordinates, outCoordinates],
		([currentInCoordinates, currentOutCoordinates]) => {
			const x1 = currentInCoordinates.x;
			const y1 = currentInCoordinates.y;
			const x2 = currentOutCoordinates.x;
			const y2 = currentOutCoordinates.y;

			const width = Math.abs(x2 - x1);
			const height = Math.abs(y2 - y1);

			// adjust svg position
			// there's a more concise way to do this
			// need to account for which side of the cable corresponds to left
			// 1st point is on left
			if (x1 < x2) {
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

			return {
				startY,
				endY,
				width,
				height
			};
		}
	);

	const pathString = derived(pathDescriptor, ({ startY, endY, width, height }) => {
		// making bezier with 4 points (start, [0, height/2], [width, height/2], end)
		return `M ${0} ${startY} C ${0} ${height / 2}, ${width} ${height / 2}, ${width} ${endY}`;
	});

	const pathStrokeWidth = 4;
</script>

<svg
	style:--path-stroke-width="{pathStrokeWidth}px"
	style="width: {$pathDescriptor.width}px; height: {$pathDescriptor.height}px; left: {left}px; top: {top}px;"
	class:dragging
>
	<path d={$pathString} />
</svg>

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
