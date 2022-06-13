<script lang="ts">
	import { Direction, FlavorType } from '$lib/common/types';
	import {} from '$lib/flavors/plugins';

	import CursorCircle from '$lib/components/CursorCircle.svelte';
	import IngredientComponent from '$lib/components/Ingredient.svelte';
	import Dock from '$lib/components/Dock.svelte';
	import { ActionType, handleAction, type Action } from '$lib/events';

	import type { WritableState } from '$lib/stores/state';
	import type { ReadableView } from '$lib/stores/view';

	export let state: WritableState;
	export let view: ReadableView;

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
		handleAction(action);
	}

	$: nodes = view.nodes;
</script>

{#each $nodes as node}
	<IngredientComponent
		{view}
		ingredientUuid={node.uuid}
		name={node.name}
		flavors={node.flavors}
		coords={node.location}
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
