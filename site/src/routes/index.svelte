<script lang="ts" context="module">
	import { FlavorType } from '$lib/flavors';
	import { Direction, type FullRecipe } from '$lib/common/types';

	/** @type {import('./index').Load} */
	export async function load({ params, fetch, session, stuff }) {
		const recipe: FullRecipe = {
			id: null,
			mainIngredientId: null,
			mainIngredient: {
				id: null,
				flavors: [
					{
						id: null,
						ingredientId: null,
						name: 'image',
						type: FlavorType.Image,
						directions: [Direction.Out],
						parameters: {}
					}

					// {
					// 	name: 'audio',
					// 	type: FlavorType.Audio,
					// 	directions: [Direction.In, Direction.Out],
					// 	initial: { text: '' }
					// }
				],
				subIngredients: [],
				connections: [],
				x: null,
				y: null
			}
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

	export let recipe: FullRecipe;
</script>

<Dish flavors={recipe.mainIngredient.flavors} ingredients={recipe.mainIngredient.subIngredients} />

<svelte:window bind:innerWidth bind:innerHeight />
