<script lang="ts">
	import { type Terminal, terminalHeight } from '$lib/state/stores/view';

	import TerminalComponent from '$lib/components/Terminal.svelte';

	export let terminal: Terminal;
</script>

<TerminalComponent {terminal} expanded={true} live={true} {terminalHeight} />
