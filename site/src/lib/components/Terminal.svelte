<script lang="ts">
	import { getContext } from 'svelte';

	import { Direction, FlavorType } from '$lib/common/types';
	import { calculateCenter } from '$lib/common/utils';

	import type { ViewState } from '$lib/state/stores/view';
	import { viewStateContextKey } from '$lib/state';
	import type { Terminal } from '$lib/state/stores/view/terminals';

	export let terminal: Terminal;

	export let flavorType: FlavorType;

	export let live = false;
	export let expanded: boolean;

	export let terminalHeight: number;

	const viewState: ViewState = getContext(viewStateContextKey);

	// export let actionDescriptions: ActionDescription<any>[];
	function updateCoordsAction(element: HTMLElement) {
		let updateRect = () => {
			// calculate the rect and dispatch to the callback
			let rect: DOMRect = element.getBoundingClientRect();
			// accounts for scroll
			rect.x += window.pageXOffset;
			rect.y += window.pageYOffset;
			let center = calculateCenter(rect);
			terminal.coordinates.set({
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

	// grabbing novel terminal should start relaying the coords of the terminal
	// and add event listeners for release
	function novelGrabAction(element: HTMLElement) {
		const handleMouseUp = (event: MouseEvent) => {
			window.removeEventListener('mouseup', handleMouseUp);
			element.style.cursor = '';
		};

		const handleNovelGrab = (event: MouseEvent) => {
			if (event.button == 0 && terminal.flavorUuid) {
				const dragDirection = terminal.direction == Direction.In ? Direction.Out : Direction.In;
				viewState.liveConnection.anchor(
					terminal.connectionUuid,
					terminal.flavorUuid,
					terminal.direction,
					dragDirection
				);
				window.addEventListener('mouseup', handleMouseUp);
				element.style.cursor = 'grabbing';
			}
		};

		element.addEventListener('mousedown', handleNovelGrab);

		return {
			destroy() {
				element.removeEventListener('mousedown', handleNovelGrab);
			}
		};
	}

	function dragTerminalAction(element: HTMLElement, live: boolean) {
		let unsub: () => void;
		if (live) {
			unsub = viewState.cursorCoordinates.subscribe((currentCursorCoordinates) => {
				element.style.left = currentCursorCoordinates.x + 'px';
				element.style.top = currentCursorCoordinates.y + 'px';
			});

			console.log('drag');
		}

		// update that cable has been dropped
		// const onMouseUp = (event: MouseEvent) => {
		// 	$dropCable({ x: event.pageX, y: event.pageY });
		// 	// this is causing the live connection attach callback to disappear
		// 	window.removeEventListener('mouseup', onMouseUp);
		// };
		// window.addEventListener('mouseup', onMouseUp);

		return {
			update(newLive: boolean) {
				if (unsub) unsub();
				live = newLive;
			},
			destroy() {
				if (unsub) unsub();
			}
		};
	}
</script>

<div
	use:updateCoordsAction
	use:novelGrabAction
	use:dragTerminalAction={live}
	class="terminal"
	class:out={terminal.direction == Direction.Out}
	class:in={terminal.direction == Direction.In}
	class:expanded
	class:cabled={terminal.cabled}
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
