<script lang="ts">
	import { derived, type Readable } from 'svelte/store';
	import { Direction } from '$lib/common/types';
	import {
		type CallFor,
		type Ingredient,
		type Location,
		type Flavor,
		FlavorType
	} from '$lib/common/types';
	import {} from '$lib/flavors/plugins';

	// store access
	import { recipeUuid, ingredients, locations } from '$lib/stores';
	import { addCallFor, callsFor } from '$lib/stores/callsFor';
	import { addIngredient } from '$lib/stores/ingredients';
	import { addLocation } from '$lib/stores/locations';
	import { addFlavor, flavors } from '$lib/stores/flavors';

	import CursorCircle from '$lib/components/CursorCircle.svelte';
	import IngredientComponent from '$lib/components/Ingredient.svelte';
	import Dock from '$lib/components/Dock.svelte';

	export let focusedCallForUuid: string;

	const focusedCallsFor = derived(
		[callsFor, ingredients],
		([currentCallsFor, currentIngredients]) =>
			Array.from(currentCallsFor.values()).filter(
				(callFor) =>
					currentIngredients.get(callFor.ingredientUuid)?.parentIngredientUuid == focusedCallForUuid
			)
	);

	function createIngredient(coords: { x: number; y: number }) {
		const newIngredient = addIngredient({
			name: 'default',
			parentIngredientUuid: focusedCallForUuid
		});

		const newCallFor = addCallFor({
			recipeUuid: $recipeUuid,
			ingredientUuid: newIngredient.uuid
		});

		addFlavor({
			ingredientUuid: newIngredient.uuid,
			type: FlavorType.Text,
			name: 'text',
			options: null,
			directions: [Direction.Out]
		});

		addLocation({ ...coords, callForUuid: newCallFor.uuid });
	}

	// collapse the stores into a list of currently-in-view ingredients with flavors and location
	const nodes: Readable<(Ingredient & { flavors: Flavor[]; location: Location })[]> = derived(
		[focusedCallsFor, ingredients, flavors, locations],
		([currentFocusedCallsFor, currentIngredients, currentFlavors, currentLocations]) => {
			return Array.from(currentFocusedCallsFor.values()).map((callFor) => {
				const ingredient = currentIngredients.get(callFor.ingredientUuid);

				const location = Array.from(currentLocations.values()).find(
					(location) => location.callForUuid == callFor.uuid
				);

				if (!ingredient || !location) {
					throw 'wtf';
				}

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
