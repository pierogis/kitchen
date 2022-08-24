<script lang="ts">
	import { checkNearAction } from '$lib/common/actions/checkNear';

	export let expanded = false;

	function handleNear(event: CustomEvent<boolean>) {
		expanded = event.detail;
	}
</script>

<div class="tab" class:expanded use:checkNearAction={10} on:near={handleNear}>
	<slot />
</div>

<style>
	.tab {
		max-height: 10px;

		padding-top: 0px;
		padding-bottom: 0px;
		padding-left: 10px;
		padding-right: 10px;

		border-bottom-left-radius: var(--border-radius);
		border-bottom-right-radius: var(--border-radius);

		background-color: var(--primary-color);

		transition: max-height 100ms, padding 100ms;
	}

	.tab > :global(*) {
		transition: opacity 300ms;
	}

	.expanded {
		max-height: none;

		padding-top: 10px;
		padding-bottom: 10px;
	}

	.tab:not(.expanded) > :global(*) {
		transition: opacity 100ms;
	}

	:not(.expanded) > :global(*) {
		opacity: 0;
	}
</style>
