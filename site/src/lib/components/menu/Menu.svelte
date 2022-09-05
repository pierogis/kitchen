<script lang="ts">
	import MenuTab from './MenuTab.svelte';
	import HelpButton from './HelpButton.svelte';
	import UnfocusButton from './UnfocusButton.svelte';
</script>

<div class="menu">
	<MenuTab>
		<UnfocusButton />
		<HelpButton />
	</MenuTab>
</div>

<style>
	.menu {
		position: absolute;
		top: 0;

		z-index: 1;
	}
</style>
