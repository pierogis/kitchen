<script lang="ts">
	import { getContext } from 'svelte';
	import { derived, get, type Readable } from 'svelte/store';

	import { Direction, FlavorType } from '$lib/common/types';
	import { ActionType, type Action } from '$lib/state/actions';

	import type { RecipeState } from '$lib/state/stores/recipe';
	import type { Node } from '$lib/state/stores/view/nodes';
	import type { Cable } from '$lib/state/stores/view/cables';

	import {} from '$lib/flavors/plugins';

	import CursorCircle from '$lib/components/CursorCircle.svelte';
	import IngredientComponent from '$lib/components/Ingredient.svelte';
	import Dock from '$lib/components/Dock.svelte';
	import CableComponent from './Cable.svelte';
	import LiveTerminal from './LiveTerminal.svelte';

	import type { LiveConnectionState } from '$lib/state/stores/view/liveConnection';
	import type { Coordinates } from '$lib/state/stores/view';

	const recipeState: RecipeState = getContext('recipe');
	export let nodes: Readable<Node[]>;
	export let cables: Readable<Cable[]>;
	export let liveConnection: LiveConnectionState;
	export let cursorCoordinates: Readable<Coordinates>;

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

	const liveTerminal = derived(
		[cables, liveConnection],
		([currentCables, currentLiveConnection]) => {
			if (currentLiveConnection) {
				const liveCable = currentCables.find((cable) => {
					cable.connectionUuid == currentLiveConnection.connectionUuid;
				});
				if (liveCable) {
					return {
						dragDirection: currentLiveConnection.dragDirection,
						flavorType: currentLiveConnection.flavorType,
						cableCoordinates:
							currentLiveConnection.dragDirection == Direction.In
								? liveCable.inCoordinates
								: liveCable.outCoordinates,
						connectionUuid: currentLiveConnection.connectionUuid
					};
				}
			}
		}
	);
</script>

{#each $nodes as node (node.callFor.uuid)}
	<IngredientComponent
		ingredient={node.ingredient}
		flavors={node.flavors}
		callFor={node.callFor}
		location={node.location}
	/>
{/each}

{#each $cables as cable (cable.connectionUuid)}
	<CableComponent inCoordinates={cable.inCoordinates} outCoordinates={cable.outCoordinates} />
{/each}

{#if $liveTerminal}
	<LiveTerminal
		terminal={{
			coordinates: $liveTerminal.cableCoordinates,
			flavorUuid: undefined,
			direction: $liveTerminal.dragDirection,
			cabled: true,
			connectionUuid: $liveTerminal.connectionUuid
		}}
		flavorType={$liveTerminal.flavorType}
		{cursorCoordinates}
	/>
{/if}

<Dock direction={Direction.In} />
<Dock direction={Direction.Out} />

<CursorCircle
	on:longpress={(event) => {
		let coords = event.detail;
		createIngredient(coords);
	}}
/>
