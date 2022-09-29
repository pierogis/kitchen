<script lang="ts">
	import { draggableAction } from '$lib/common/actions/draggableAction';

	export let handleFocus: ((event: MouseEvent) => void) | undefined = undefined;
	export let handleRemove: ((event: MouseEvent) => void) | undefined = undefined;

	export let dragTarget: HTMLElement;
</script>

<div class="header">
	{#if handleFocus}
		<div class="focus no-select" on:mousedown|stopPropagation={handleFocus} />
	{/if}

	<div class="handle no-select" class:no-focus={!handleFocus} use:draggableAction={dragTarget}>
		<div class="handle-dot" />
		<div class="handle-dot" />
	</div>

	{#if handleRemove}
		<div class="remove no-select" on:mousedown|stopPropagation={handleRemove} />
	{/if}
</div>

<style>
	.header {
		display: flex;
		height: var(--node-header-size);
		margin-bottom: 4px;
	}

	.handle {
		background-color: var(--primary-color);

		box-shadow: 0 2px 4px var(--shadow-color);

		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;

		cursor: grab;
	}

	.handle.no-focus {
		border-top-left-radius: 6px;
		border-bottom-left-radius: 6px;
	}

	.handle-dot {
		background-color: var(--button-color-hover);
		border-radius: 50%;
		height: 4px;
		width: 4px;
		margin: 2px;
	}

	.focus,
	.remove {
		box-shadow: 0 2px 4px var(--primary-color-shadow);
		width: var(--node-header-size);
		cursor: pointer;
	}

	.remove:hover,
	.focus:hover,
	.handle:hover {
		filter: brightness(90%) saturate(150%);
	}

	.focus {
		background-color: var(--focus-color);

		border-radius: 6px 0px 0px 6px;

		margin-right: 5px;
	}

	.remove {
		background-color: var(--remove-color);

		border-radius: 0px 6px 6px 0px;

		margin-left: 5px;
	}
</style>
