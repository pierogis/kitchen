<script lang="ts" context="module">
	import { FlavorType } from '@prisma/client';
	import { Direction, type FullRecipe } from '$lib/common/types';

	/** @type {import('./index').Load} */
	export async function load() {
		const recipe: FullRecipe = {
			id: null,
			mainIngredientId: null,
			mainIngredient: {
				id: null,
				name: 'main',
				flavors: [
					{
						id: null,
						ingredientId: null,
						name: 'image',
						type: FlavorType.Image,
						directions: [Direction.Out],
						parameters: {},
						options: {}
					}

					// {
					// 	name: 'audio',
					// 	type: FlavorType.Audio,
					// 	directions: [Direction.In, Direction.Out],
					// 	initial: { text: '' }
					// }
				],
				parentIngredientId: null,
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

<Dish
	ingredientId={recipe.mainIngredientId}
	flavors={recipe.mainIngredient.flavors}
	ingredients={recipe.mainIngredient.subIngredients}
	connections={recipe.mainIngredient.connections}
/>

<svelte:window bind:innerWidth bind:innerHeight />
