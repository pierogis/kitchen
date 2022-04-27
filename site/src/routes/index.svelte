<script lang="ts">
	import Dish from '$lib/Dish.svelte';
	import { viewportStore } from '$lib/viewport/viewport';

	let innerWidth = 0,
		innerHeight = 0;

	viewportStore.set({ width: innerWidth, height: innerHeight });
</script>

<Dish />

<svelte:window bind:innerWidth bind:innerHeight />
