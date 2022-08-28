<script>
	import HelpTab from './HelpTab.svelte';
	import MenuTab from './MenuTab.svelte';
</script>

<div class="menu">
	<MenuTab>
		<HelpTab />
	</MenuTab>
</div>

<style>
	.menu {
		position: absolute;
		top: 0;
		right: 0;

		z-index: 1;
	}
</style>
