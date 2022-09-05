<script lang="ts">
	import { getContext } from 'svelte';

	import { viewStateContextKey, type ViewState } from '@state/stores/view';

	import { DragHeader } from '@components';

	const viewState: ViewState = getContext(viewStateContextKey);
	// delete node on close button
	function handleRemove(_event: MouseEvent) {
		viewState.showHelp.set(false);
	}

	let dragTarget: HTMLElement;
</script>

<div class="modal-container" style:--node-header-size="12px" bind:this={dragTarget}>
	{#if dragTarget}
		<DragHeader {handleRemove} {dragTarget} />
	{/if}
	<div class="modal" bind:this={dragTarget}>
		<div>ctrl + e -> edit mode</div>
		<div>dbl click -> new ingredient</div>
		<div>
			<a href="/glossary">glossary</a>
		</div>
	</div>
</div>

<style>
	.modal-container {
		position: fixed;

		transform: translate(-50%, -50%);
		top: 50%;
		left: 50%;

		width: 16rem;
		max-width: 50%;

		z-index: 2;
	}
	.modal {
		height: 10rem;
		max-height: 50%;

		display: flex;
		flex-direction: column;

		place-content: center;
		place-items: center;

		background-color: var(--primary-color);
		color: var(--text-color);

		font-family: Menlo;
		font-size: 11px;

		border-radius: var(--border-radius);
	}
</style>
