<script lang="ts">
	import { derived, type Readable } from 'svelte/store';
	import {
		Direction,
		type CallFor,
		type Ingredient,
		type Location,
		type Flavor,
		FlavorType
	} from '$lib/common/types';
	import {} from '$lib/flavors/plugins';

	// store access
	import { recipeUuid, ingredients, locations, flavors, callsFor } from '$lib/stores';

	import CursorCircle from '$lib/components/CursorCircle.svelte';
	import IngredientComponent from '$lib/components/Ingredient.svelte';
	import Dock from '$lib/components/Dock.svelte';
	import { ActionType, handleAction, type Action } from '$lib/events';

	export let focusedCallForUuid: string;

	const focusedCallsFor = derived(
		[callsFor, ingredients],
		([currentCallsFor, currentIngredients]) =>
			Array.from(currentCallsFor.values()).filter(
				(callFor) => callFor.parentCallForUuid == focusedCallForUuid
			)
	);

	function createIngredient(coordinates: { x: number; y: number }) {
		const action: Action<ActionType.CreateIngredient> = {
			type: ActionType.CreateIngredient,
			params: {
				ingredient: {
					name: 'default'
				},
				callFor: {
					parentCallForUuid: focusedCallForUuid,
					recipeUuid: $recipeUuid
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

	// collapse the stores into a list of currently-in-view ingredients with flavors and location
	const nodes: Readable<(Ingredient & { flavors: Flavor[]; location: Location })[]> = derived(
		[focusedCallsFor, ingredients, flavors, locations],
		([currentFocusedCallsFor, currentIngredients, currentFlavors, currentLocations]) => {
			return Array.from(currentFocusedCallsFor.values()).map((callFor) => {
				// find ingredient that matches this callFor
				const ingredient = currentIngredients.get(callFor.ingredientUuid);

				// find ingredient that matches this callFor
				if (!ingredient) {
					throw "Couldn't find referenced ingredient";
				}

				// find location that matches this callFor
				const location = Array.from(currentLocations.values()).find(
					(location) => location.callForUuid == callFor.uuid
				);

				if (!location) {
					throw "Couldn't find referenced location";
				}

				// get the flavors that attach to this ingredient
				const ingredientFlavors = Array.from(currentFlavors.values()).filter(
					(flavor) => flavor.ingredientUuid == ingredient.uuid
				);

				return { ...ingredient, flavors: ingredientFlavors, location };
			});
		}
	);

	// used for the side docks
	const focusedFlavors = derived([flavors], ([currentFlavors]) => {
		return Array.from(currentFlavors.values()).filter(
			(flavor) => flavor.ingredientUuid == focusedCallForUuid
		);
	});
</script>

{#each $nodes as node}
	<IngredientComponent
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
