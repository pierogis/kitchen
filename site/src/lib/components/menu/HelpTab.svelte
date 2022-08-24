<script lang="ts">
	import { getContext } from 'svelte';

	import { type ViewState, viewStateContextKey } from '@view';

	const viewState: ViewState = getContext(viewStateContextKey);

	function handleClick() {
		viewState.showHelp.set(true);
	}
</script>

<div class="help">
	<button on:click={handleClick}>?</button>
</div>

<style>
</style>
