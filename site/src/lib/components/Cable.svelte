<script lang="ts">
	import { derived, type Readable } from 'svelte/store';

	import type { Coordinates } from '@types';
	import { tweened } from 'svelte/motion';

	export let outCoordinates: Readable<Coordinates>;
	export let inCoordinates: Readable<Coordinates>;

	const width = derived(
		[inCoordinates, outCoordinates],
		([$inCoordinates, $outCoordinates]) => $inCoordinates.x - $outCoordinates.x
	);
	const height = derived(
		[inCoordinates, outCoordinates],
		([$inCoordinates, $outCoordinates]) => $inCoordinates.y - $outCoordinates.y
	);

	const tweenedMidpoint1 = tweened(
		{
			x: $outCoordinates.x + $width * 0.2,
			y: $outCoordinates.y + $height / 2
		},
		{
			delay: 40,
			duration: 150
		}
	);

	$: $tweenedMidpoint1 = {
		x: $outCoordinates.x + $width * 0.2,
		y: $outCoordinates.y + $height / 2
	};

	const tweenedMidpoint2 = tweened(
		{
			x: $outCoordinates.x + $width * 0.8,
			y: $outCoordinates.y + $height / 2
		},
		{
			delay: 40,
			duration: 150
		}
	);

	$: $tweenedMidpoint2 = {
		x: $outCoordinates.x + $width * 0.8,
		y: $outCoordinates.y + $height / 2
	};

	const pathString = derived(
		[inCoordinates, outCoordinates, tweenedMidpoint1, tweenedMidpoint2],
		([$inCoordinates, $outCoordinates, $tweenedMidpoint1, $tweenedMidpoint2]) => {
			// making bezier with 4 points
			return `M ${$outCoordinates.x} ${$outCoordinates.y} C ${$tweenedMidpoint1.x} ${$tweenedMidpoint1.y}, ${$tweenedMidpoint2.x} ${$tweenedMidpoint2.y}, ${$inCoordinates.x} ${$inCoordinates.y}`;
		}
	);
</script>

<path d={$pathString} />

<style>
	path {
		stroke: var(--cable-color-number);
		opacity: 0.9;
		stroke-width: var(--path-stroke-width);
		fill: transparent;

		cursor: grab;
		pointer-events: auto;
	}
</style>
