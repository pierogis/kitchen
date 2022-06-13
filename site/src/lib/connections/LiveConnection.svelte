<script lang="ts">
	import { calculateCenter } from '../common/utils';
	import type { LiveConnectionState } from '../stores/view/live-connection';
	import { terminalHeight } from '$lib/stores/view/terminals';

	import Cable from '$lib/components/Cable.svelte';
	import Terminal from '$lib/terminals/Terminal.svelte';
	import type { Readable } from 'svelte/store';

	export let liveConnection: Readable<LiveConnectionState>;
	export let dropCable: Readable<(coords: { x: number; y: number }) => void>;

	// access to a store of the coords for when a cable is being dragged
	$: dragCoordsStore = $liveConnection && $liveConnection.dragCoordsStore;

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
		const onMouseUp = (event: MouseEvent) => {
			$dropCable({ x: event.pageX, y: event.pageY });
			// this is causing the live connection attach callback to disappear
			window.removeEventListener('mouseup', onMouseUp);
		};
		window.addEventListener('mouseup', onMouseUp);

		return {
			destroy() {
				window.removeEventListener('mousemove', moveTerminal);
				window.removeEventListener('mouseup', onMouseUp);
				clearInterval(dragTerminalTimer);
			}
		};
	}
</script>

{#if $liveConnection}
	<Cable inCoords={$liveConnection.dragCoordsStore} outCoords={$liveConnection.anchorCoordsStore} />
	<Terminal
		actionDescriptions={[
			{
				action: dragTerminalAction
			}
		]}
		direction={$liveConnection.dragDirection}
		expanded={true}
		cabled={true}
		live={true}
		{terminalHeight}
	/>
{/if}
