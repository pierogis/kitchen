<script lang="ts">
	import { getContext } from 'svelte';
	import { derived } from 'svelte/store';

	import { type ViewState, viewStateContextKey } from '@view';
	import { type RecipeState, recipeStateContextKey } from '@recipe';
	import { ActionType } from '@state/actions';

	const viewState: ViewState = getContext(viewStateContextKey);
	const recipeState: RecipeState = getContext(recipeStateContextKey);

	const parentUsageUuid = derived(
		viewState.parentUsageUuid,
		($parentUsageUuid) => $parentUsageUuid
	);

	function handleClick(ev: MouseEvent) {
		if (ev.button == 0 && $parentUsageUuid) {
			recipeState.dispatch({
				type: ActionType.FocusUsage,
				params: { usageUuid: $parentUsageUuid }
			});
		}
	}
</script>

<button disabled={$parentUsageUuid == undefined} on:click={handleClick}>^</button>

<style>
</style>
