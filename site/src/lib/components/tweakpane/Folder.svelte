<script lang="ts">
	import type { Pane } from 'tweakpane';

	export let pane: Pane;
	export let title: string;

	const folder = pane.addFolder({
		title
	});
</script>

<slot {folder} />
