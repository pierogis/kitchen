<script lang="ts">
	import { onMount } from 'svelte';

	import type { Pane } from 'tweakpane';

	export let pane: Pane;
	export let title: string;
	export let index: number;

	const folder = pane.addFolder({
		title,
		index
	});

	onMount(() => {
		const container = folder.element;
		folderContainer.append(container);
		pane.controller_.rackController.view.element.append(folderContainer);

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
