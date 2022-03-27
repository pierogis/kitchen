<script lang="ts">
	import { calculateCenter } from '../common/utils';
	import { dropCableStore, liveConnectionStore } from './live-connection';
	import { terminalHeight } from '../terminals/terminals';

	import Cable from './Cable.svelte';
	import Terminal from '../terminals/Terminal.svelte';

	// access to a store of the coords for when a cable is being dragged
	$: dragCoordsStore = $liveConnectionStore && $liveConnectionStore.dragCoordsStore;

	function dragTerminalAction(element: HTMLElement) {
		let dragTerminalTimer: NodeJS.Timer;

		element.style.left = $dragCoordsStore.x + 'px';
		element.style.top = $dragCoordsStore.y + 'px';

		const moveTerminal = (event: MouseEvent) => {
			event.preventDefault();
			element.style.top = event.y + 'px';
			element.style.left = event.x + 'px';
		};
		window.addEventListener('mousemove', moveTerminal);

		dragTerminalTimer = setInterval(() => {
			const rect = element.getBoundingClientRect();
			const center = calculateCenter(rect);
			dragCoordsStore.set({
				x: center.x,
				y: center.y
			});
		}, 10);

		// update restaurant that cable has been dropped
		const dropCable = (event: MouseEvent) => {
			$dropCableStore({ x: event.pageX, y: event.pageY });
			// this is causing the live connection attach callback to disappear
			window.removeEventListener('mouseup', dropCable);
		};
		window.addEventListener('mouseup', dropCable);

		return {
			destroy() {
				window.removeEventListener('mousemove', moveTerminal);
				window.removeEventListener('mouseup', dropCable);
				clearInterval(dragTerminalTimer);
			}
		};
	}
</script>

{#if $liveConnectionStore}
	<Cable
		inCoords={$liveConnectionStore.dragCoordsStore}
		outCoords={$liveConnectionStore.anchorCoordsStore}
	/>
	<Terminal
		actionDescriptions={[
			{
				action: dragTerminalAction
			}
		]}
		direction={$liveConnectionStore.dragTerminalDirection}
		expanded={true}
		cabled={true}
		live={true}
		{terminalHeight}
	/>
{/if}
