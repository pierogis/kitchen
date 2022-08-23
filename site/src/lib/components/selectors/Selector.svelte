<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// generic for the bound value type of this input
	type T = $$Generic;
	export let optGroups: { [groupName: string]: { [optionName: string]: T } } = {};
	export let options: { [optionName: string]: T } = {};

	const dispatch = createEventDispatcher<{ select: [string, T] }>();

	function handleSelect() {
		dispatch('select', selected);
	}

	let selected: [string, T];
</script>

<select bind:value={selected} on:change={handleSelect}>
	{#each Object.entries(optGroups) as [groupName, groupOptions]}
		<optgroup label={groupName}>
			{#each Object.entries(groupOptions) as [optionName, value]}
				<option value={[optionName, value]}>{optionName}</option>
			{/each}
		</optgroup>
	{/each}
	{#each Object.entries(options) as [name, value]}
		<option value={[name, value]}>{name}</option>
	{/each}
</select>
