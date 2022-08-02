<script lang="ts">
	import { onMount } from 'svelte';

	import type { Pane } from 'tweakpane';

	export let pane: Pane;
	export let title: string;

	const folder = pane.addFolder({
		title
	});

	onMount(() => {
		const container = folder.element;
		folderContainer.append(container);
		pane.element.append(folderContainer);

		// container.style.display = 'flex';
		// container.style.placeItems = 'center';

		return () => {
			pane.remove(folder);
		};
	});

	let folderContainer: HTMLElement;
</script>

<slot {folder} {folderContainer} />

<div class="folder-container" bind:this={folderContainer} />

<style>
	.folder-container {
		display: flex;
		place-items: center;
	}
</style>
