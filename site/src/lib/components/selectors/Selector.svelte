<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// generic for the bound value type of this input
	type T = $$Generic;
	export let options: { [name: string]: T };

	export let x: number;
	export let y: number;

	const dispatch = createEventDispatcher<{ select: [string, T] }>();

	function handleSelect() {
		dispatch('select', selected);
	}

	let selected: [string, T];
</script>

<select style:left="{x}px" style:top="{y}px" bind:value={selected} on:change={handleSelect}>
	{#each Object.entries(options) as [name, value]}
		<option value={[name, value]}>{name}</option>
	{/each}
</select>

<style>
	select {
		align-self: center;
	}
</style>
