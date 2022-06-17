<script lang="ts">
	import { getContext } from 'svelte';

	import { Direction } from '$lib/common/types';
	import { calculateCenter } from '$lib/common/utils';

	import type { LiveConnection, ViewState } from '$lib/state/stores/view';
	import { viewStateContextKey } from '$lib/state';
	import type { Terminal } from '$lib/state/stores/view/terminals';
	import { derived } from 'svelte/store';

	import { useActions, type ActionDescription } from '$lib/common/actions/useActions';

	export let terminal: Terminal;
	export let actionDescriptions: ActionDescription<any>[] = [];

	export let live = false;
	export let expanded: boolean;

	export let terminalHeight: number;

	const viewState: ViewState = getContext(viewStateContextKey);

	// export let actionDescriptions: ActionDescription<any>[];
	function updateCoordsAction(element: HTMLElement) {
		const getPosition = () => {
			// calculate the rect and dispatch to the callback
			let rect: DOMRect = element.getBoundingClientRect();
			// accounts for scroll
			rect.x += window.pageXOffset;
			rect.y += window.pageYOffset;
			let center = calculateCenter(rect);

			return center;
		};

		const updateRect = () => {
			const center = getPosition();
			// update central store
			viewState.terminalCoordinates.updateCoordinates(terminal, {
				x: center.x,
				y: center.y
			});
		};

		// register this terminal
		viewState.terminalCoordinates.addTerminal(terminal, getPosition());
		// callback every 10ms to update the coordinates
		let rectUpdateInterval = setInterval(updateRect, 10);

		return {
			destroy() {
				viewState.terminalCoordinates.deleteTerminal(terminal);
				clearInterval(rectUpdateInterval);
			}
		};
	}

	// grabbing a terminal should start relaying the coords of the terminal and update state
	function grabTerminalAction(
		element: HTMLElement,
		params: { cabled: boolean; liveConnection: LiveConnection | undefined }
	) {
		const handleMouseDown = (event: MouseEvent) => {
			if (event.button == 0 && terminal.flavorUuid) {
				const dragDirection = terminal.direction == Direction.In ? Direction.Out : Direction.In;
				if (params.cabled) {
					viewState.liveConnection.disconnect(terminal);
				} else {
					viewState.liveConnection.anchor(
						terminal.connectionUuid,
						terminal.flavorUuid,
						terminal.direction,
						dragDirection
					);
				}

				element.style.cursor = 'grabbing';
			}
		};

		if (!params.liveConnection) {
			element.addEventListener('mousedown', handleMouseDown);
		}

		return {
			update(newParams: { cabled: boolean; liveConnection: LiveConnection | undefined }) {
				params = newParams;
				if (params.liveConnection) {
					element.removeEventListener('mousedown', handleMouseDown);
				} else {
					element.addEventListener('mousedown', handleMouseDown);
				}
			},
			destroy() {
				element.removeEventListener('mousedown', handleMouseDown);
			}
		};
	}

	const liveConnection = derived(
		viewState.liveConnection,
		(currentLiveConnection) => currentLiveConnection
	);
</script>

<div
	class="terminal-container"
	use:grabTerminalAction={{ cabled: terminal.cabled, liveConnection: $liveConnection }}
>
	<div
		use:useActions={actionDescriptions}
		use:updateCoordsAction
		class="terminal"
		class:out={terminal.direction == Direction.Out}
		class:in={terminal.direction == Direction.In}
		class:expanded
		class:cabled={terminal.cabled}
		class:live
		style:--terminal-height="{terminalHeight}px"
	/>
</div>

<style>
	.terminal-container {
		padding: 6px;
		margin: -6px;
		cursor: grab;
	}
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
