<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let attached: boolean;

	const dispatch = createEventDispatcher();

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		dispatch('click');
	}
</script>

<button class="no-select" class:attached on:click|preventDefault={handleClick}>+</button>

<style>
	button {
		background-color: var(--primary-color);
		transition: background-color 200ms;
		color: var(--label-color);

		border: 0;
		margin: 0;
		padding-top: 0;
		padding-bottom: 4px;

		font-size: 1.1rem;
		line-height: 100%;

		border-radius: 4px 4px 4px 4px;

		align-self: center;
	}

	button:hover {
		background-color: var(--button-color);
	}

	button:active {
		background-color: var(--primary-color);
	}

	.attached {
		border-top: 1px var(--shadow-color) solid;
		border-radius: 0 0 4px 4px;
	}
</style>
