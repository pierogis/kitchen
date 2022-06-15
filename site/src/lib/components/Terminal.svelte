<script lang="ts">
	import type { Writable } from 'svelte/store';

	import { Direction } from '$lib/common/types';
	import { calculateCenter } from '$lib/common/utils';
	import type { Coordinates } from '$lib/state/stores/view';

	export let coordinates: Writable<Coordinates | undefined>;
	export let direction: Direction;
	export let expanded: boolean;
	export let terminalHeight: number;
	export let cabled: boolean;
	export let live = false;

	// export let actionDescriptions: ActionDescription<any>[];
	function updateCoordsAction(element: HTMLElement) {
		let updateRect = () => {
			// calculate the rect and dispatch to the callback
			let rect: DOMRect = element.getBoundingClientRect();
			// accounts for scroll
			rect.x += window.pageXOffset;
			rect.y += window.pageYOffset;
			let center = calculateCenter(rect);
			coordinates.set({
				x: center.x,
				y: center.y
			});
		};

		let rectUpdateInterval = setInterval(updateRect, 10);

		return {
			destroy() {
				clearInterval(rectUpdateInterval);
			}
		};
	}
</script>

<div
	use:updateCoordsAction
	class="terminal"
	class:out={direction == Direction.Out}
	class:in={direction == Direction.In}
	class:expanded
	class:cabled
	class:live
	style:--terminal-height="{terminalHeight}px"
/>

<style>
	.terminal {
		--border-width: 2px;
		position: relative;
		width: 0px;
		height: var(--terminal-height);

		border: 0px inset var(--cable-color-number);
		background-color: hsla(0, 0%, 40%, 1);

		transition: border-radius 300ms, border 300ms, margin 300ms, width 300ms, left 300ms,
			right 300ms;
		z-index: 1;
		cursor: grab;

		pointer-events: all;
	}

	.terminal:focus {
		border: var(--border-width) inset var(--cable-color-number);
		width: 2px;

		margin: -2px;
		z-index: 2;

		/* outline-color: transparent;
    outline-style: none; */
	}

	.in {
		border-radius: 10% 50% 50% 10%;
		right: 2px;
	}

	.out {
		border-radius: 50% 10% 10% 50%;
		left: 2px;
	}

	.cabled {
		border: var(--border-width) inset var(--cable-color-number);
		background-color: var(--button-color-hover);
		width: 2px;

		margin: -2px;
		z-index: 2;
	}

	.cabled.in,
	.terminal.in:focus {
		border-radius: 50% 10% 10% 50%;
		right: 4px;
	}

	.cabled.out,
	.terminal.out:focus {
		border-radius: 10% 50% 50% 10%;
		left: 4px;
	}

	.expanded,
	.terminal.expanded:focus {
		width: var(--terminal-height);
	}

	.expanded.in,
	.terminal.expanded.in:focus {
		right: 0px;
		border-radius: 50% 50% 50% 50%;
	}

	.expanded.out,
	.terminal.expanded.out:focus {
		left: 0px;
		border-radius: 50% 50% 50% 50%;
	}

	.live {
		position: absolute;
		transition: all 0s;
		margin: calc(-1 * (var(--terminal-height) / 2 + var(--border-width)));
		z-index: 2;

		cursor: grabbing;
	}
</style>
