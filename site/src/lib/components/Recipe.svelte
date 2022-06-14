<script lang="ts">
	import { Direction, FlavorType } from '$lib/common/types';
	import {} from '$lib/flavors/plugins';

	import CursorCircle from '$lib/components/CursorCircle.svelte';
	import IngredientComponent from '$lib/components/Ingredient.svelte';
	import Dock from '$lib/components/Dock.svelte';
	import { ActionType, type Action } from '$lib/state/actions';

	import type { ActionableState } from '$lib/state/stores/state';
	import type { ReadableView } from '$lib/state/stores/view';
	import { getContext } from 'svelte';

	const state: ActionableState = getContext('state');
	const view: ReadableView = getContext('view');

	function createIngredient(coordinates: { x: number; y: number }) {
		const action: Action<ActionType.CreateIngredient> = {
			type: ActionType.CreateIngredient,
			params: {
				ingredient: {
					name: 'default'
				},
				callFor: {
					parentCallForUuid: $state.focusedCallForUuid,
					recipeUuid: $state.recipeUuid
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

		state.dispatch(action);
	}

	$: nodes = view.nodes;
</script>

{#each $nodes as node}
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
