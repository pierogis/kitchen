<script lang="ts">
	import type { Readable, Writable } from 'svelte/store';

	import { calculateCenter } from '$lib/common/utils';
	import { terminalHeight } from '$lib/state/stores/view/terminals';

	import type { Coordinates } from '$lib/state/stores/view';

	import Terminal from '$lib/components/Terminal.svelte';
	import type { Direction, FlavorType } from '$lib/common/types';

	export let dragDirection: Direction;
	export let flavorType: FlavorType;
	export let cableCoordinates: Writable<Coordinates | undefined>;
	export let cursorCoordinates: Readable<Coordinates>;

	// export let dropCable: Readable<(coords: { x: number; y: number }) => void>;

	function dragTerminalAction(element: HTMLElement) {
		let unsub = cursorCoordinates.subscribe((currentDragCoordinates) => {
			element.style.left = currentDragCoordinates.x + 'px';
			element.style.top = currentDragCoordinates.y + 'px';
		});

		// update that cable has been dropped
		// const onMouseUp = (event: MouseEvent) => {
		// 	$dropCable({ x: event.pageX, y: event.pageY });
		// 	// this is causing the live connection attach callback to disappear
		// 	window.removeEventListener('mouseup', onMouseUp);
		// };
		// window.addEventListener('mouseup', onMouseUp);

		return {
			destroy() {
				unsub();
			}
		};
	}

	// use view.liveConnection to
</script>

<Terminal
	coordinates={cableCoordinates}
	{flavorType}
	direction={dragDirection}
	expanded={true}
	cabled={true}
	live={true}
	{terminalHeight}
/>
