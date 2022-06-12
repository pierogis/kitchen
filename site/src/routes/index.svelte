<script lang="ts" context="module">
	import { defaultRecipe } from './_recipe';

	/** @type {import('./index').Load} */
	export async function load() {
		storeRecipe(defaultRecipe);

		return {
			props: {
				mainCallForUuid: defaultRecipe.mainCallForUuid
			}
		};
	}
</script>

<script lang="ts">
	import {
		storeRecipe,
		ingredients,
		callsFor,
		flavors,
		connections,
		parameters,
		shaders
	} from '$lib/stores';

	import Pan from '$lib/components/Pan.svelte';
	import Recipe from '$lib/components/Recipe.svelte';

	let innerWidth = 0,
		innerHeight = 0;

	export let mainCallForUuid: string;
	let focusedCallForUuid = mainCallForUuid;
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<Recipe {focusedCallForUuid} />

<Pan
	width={innerWidth}
	height={innerHeight}
	{mainCallForUuid}
	ingredients={$ingredients}
	flavors={$flavors}
	connections={$connections}
	shaders={$shaders}
	parameters={$parameters}
/>
