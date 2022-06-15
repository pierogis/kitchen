<script lang="ts">
	import type { Readable } from 'svelte/store';

	import { calculateCenter } from '$lib/common/utils';
	import { terminalHeight } from '$lib/state/stores/view/terminals';

	import type { Coordinates } from '$lib/state/stores/view';

	import Cable from '$lib/components/Cable.svelte';
	import Terminal from '$lib/components/Terminal.svelte';
	import type { Direction, FlavorType } from '$lib/common/types';

	export let dragDirection: Direction;
	export let flavorType: FlavorType;
	export let anchorCoordinates: Readable<Coordinates>;
	export let dragCoordinates: Readable<Coordinates>;

	// export let dropCable: Readable<(coords: { x: number; y: number }) => void>;

	// function dragTerminalAction(element: HTMLElement) {
	// 	let dragTerminalTimer: NodeJS.Timer;

	// 	element.style.left = $dragCoordinates.x + 'px';
	// 	element.style.top = $dragCoordinates.y + 'px';

	// 	const moveTerminal = (event: MouseEvent) => {
	// 		event.preventDefault();
	// 		element.style.top = event.y + 'px';
	// 		element.style.left = event.x + 'px';
	// 	};
	// 	window.addEventListener('mousemove', moveTerminal);

	// 	dragTerminalTimer = setInterval(() => {
	// 		const rect = element.getBoundingClientRect();
	// 		const center = calculateCenter(rect);
	// 		dragCoordinates.set({
	// 			x: center.x,
	// 			y: center.y
	// 		});
	// 	}, 10);

	// 	// update restaurant that cable has been dropped
	// 	const onMouseUp = (event: MouseEvent) => {
	// 		$dropCable({ x: event.pageX, y: event.pageY });
	// 		// this is causing the live connection attach callback to disappear
	// 		window.removeEventListener('mouseup', onMouseUp);
	// 	};
	// 	window.addEventListener('mouseup', onMouseUp);

	// 	return {
	// 		destroy() {
	// 			window.removeEventListener('mousemove', moveTerminal);
	// 			window.removeEventListener('mouseup', onMouseUp);
	// 			clearInterval(dragTerminalTimer);
	// 		}
	// 	};
	// }
</script>

<Cable inCoordinates={dragCoordinates} outCoordinates={anchorCoordinates} />
<Terminal
	coordinates={dragCoordinates}
	{flavorType}
	direction={dragDirection}
	expanded={true}
	cabled={true}
	live={true}
	{terminalHeight}
/>
