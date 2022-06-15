<script lang="ts">
	import { getContext } from 'svelte';
	import { get } from 'svelte/store';

	import { Direction, FlavorType } from '$lib/common/types';
	import { ActionType, type Action } from '$lib/state/actions';

	import type { RecipeState } from '$lib/state/stores/recipe';
	import type { ViewState } from '$lib/state/stores/view';

	import {} from '$lib/flavors/plugins';

	import CursorCircle from '$lib/components/CursorCircle.svelte';
	import IngredientComponent from '$lib/components/Ingredient.svelte';
	import Dock from '$lib/components/Dock.svelte';

	const recipeState: RecipeState = getContext('recipe');
	const viewState: ViewState = getContext('view');

	function createIngredient(coordinates: { x: number; y: number }) {
		const action: Action<ActionType.CreateIngredient> = {
			type: ActionType.CreateIngredient,
			params: {
				ingredient: {
					name: 'default'
				},
				callFor: {
					parentCallForUuid: get(recipeState.focusedCallForUuid),
					recipeUuid: get(recipeState.recipeUuid)
				},
				location: { ...coordinates },
				flavors: [
					{
						type: FlavorType.Text,
						name: 'text',
						options: null,
						directions: [Direction.Out]
					}
				]
			}
		};

		recipeState.dispatch(action);
	}

	$: nodes = viewState.nodes;
</script>

{#each $nodes as node (node.callFor.uuid)}
	<IngredientComponent
		ingredient={node.ingredient}
		flavors={node.flavors}
		callFor={node.callFor}
		location={node.location}
	/>
{/each}

<Dock direction={Direction.In} />
<Dock direction={Direction.Out} />

<CursorCircle
	on:longpress={(event) => {
		let coords = event.detail;
		createIngredient(coords);
	}}
/>
