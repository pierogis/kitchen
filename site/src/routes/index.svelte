<script lang="ts" context="module">
	import { FlavorType, type Flavor } from '$lib/flavors';
	import { Direction, type Recipe } from '$lib/common/types';

	/** @type {import('./index').Load} */
	export async function load({ params, fetch, session, stuff }) {
		const flavors: Flavor[] = [
			{
				name: 'image',
				type: FlavorType.image,
				directions: [Direction.out],
				initial: {
					image: new HTMLImageElement(),
					width: 0,
					height: 0
				}
			},
			{
				name: 'text',
				type: FlavorType.text,
				directions: [Direction.out],
				initial: { text: '' }
			}
		];

		const recipe: Recipe = {
			ingredients: [],
			flavors
		};

		return {
			props: {
				recipe
			}
		};
	}
</script>

<script lang="ts">
	import Dish from '$lib/components/Dish.svelte';
	import { viewportStore } from '$lib/viewport/viewport';

	let innerWidth = 0,
		innerHeight = 0;

	viewportStore.set({ width: innerWidth, height: innerHeight });

	export let recipe: Recipe;
</script>

<Dish {flavors} {ingredients} />

<svelte:window bind:innerWidth bind:innerHeight />
