<script lang="ts">
	import type { Readable, Writable } from 'svelte/store';

	import { calculateCenter } from '$lib/common/utils';
	import { terminalHeight } from '$lib/state/stores/view/terminals';

	import type { Coordinates, Terminal } from '$lib/state/stores/view';

	import TerminalComponent from '$lib/components/Terminal.svelte';

	export let terminal: Terminal;
	export let cursorCoordinates: Readable<Coordinates>;

	// export let dropCable: Readable<(coords: { x: number; y: number }) => void>;

	// use view.liveConnection to
</script>

<TerminalComponent
	{terminal}
	flavorType={terminal.flavorType}
	expanded={true}
	live={true}
	{terminalHeight}
/>
