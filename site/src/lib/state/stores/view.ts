import { derived, writable, type Writable, type Readable, get, readable } from 'svelte/store';

import type { Flavor } from '$lib/common/types';
import type { RecipeState } from './recipe';
import { createLiveConnection, type LiveConnection } from './view/live-connection';
import { createCables, type Cable } from './view/cables';
import { createNodes, type Node } from './view/nodes';
import { flatDerived } from '$lib/common/stores/flatDerived';
import type { Terminal } from './view/terminals';

export type Coordinates = { x: number; y: number };

export interface ViewState {
	cables: Readable<Cable[]>;
	nodes: Readable<Node[]>;
	dockedFlavors: Readable<Flavor[]>;
	cursorCoordinates: Writable<Coordinates>;
	liveConnection: LiveConnection;
}

export function readableViewState(recipeState: RecipeState): ViewState {
	// get all callsFor that are part of the "recipe" for the focused callFor
	const focusedCallsFor = derived(
		[recipeState.callsFor, recipeState.focusedCallForUuid],
		([currentCallsFor, currentFocusedCallForUuid]) =>
			Array.from(currentCallsFor.values()).filter(
				(callFor) => callFor.parentCallForUuid == currentFocusedCallForUuid
			)
	);

	// get the ingredient that is currently focused
	const focusedIngredient = derived(
		[recipeState.callsFor, recipeState.ingredients, recipeState.focusedCallForUuid],
		([currentCallsFor, currentIngredients, currentFocusedCallForUuid]) => {
			const focusedCallFor = currentCallsFor.get(currentFocusedCallForUuid);
			if (focusedCallFor) {
				const ingredient = currentIngredients.get(focusedCallFor.ingredientUuid);
				if (ingredient) {
					// return the focused ingredient
					return ingredient;
				} else {
					throw `Ingredient ${currentFocusedCallForUuid} not found`;
				}
			} else {
				throw `CallFor ${currentFocusedCallForUuid} not found`;
			}
		}
	);

	// create representations of connections in the current view
	const cables = createCables(recipeState, focusedIngredient);

	// callsFor/ingredients/nodes in the current view and their components
	const nodes = createNodes(recipeState, focusedCallsFor, cables);

	// flavors belonging to the focused ingredient
	const dockedFlavors = derived(
		[recipeState.flavors, focusedIngredient],
		([currentFlavors, currentFocusedIngredient]) => {
			return Array.from(currentFlavors.values()).filter(
				(flavor) => flavor.ingredientUuid == currentFocusedIngredient.uuid
			);
		}
	);

	// collapse nodes into list of all of their terminals
	const allTerminals = flatDerived<Terminal>(
		derived(nodes, (currentNodes) =>
			currentNodes.map((node) =>
				flatDerived<Terminal>(
					derived(node.flavors, (currentFlavors) =>
						currentFlavors.map((flavor) => flavor.terminals)
					)
				)
			)
		)
	);

	const cursorCoordinates = writable({ x: 0, y: 0 });

	const liveConnection = createLiveConnection(
		recipeState,
		focusedIngredient,
		allTerminals,
		cursorCoordinates
	);

	// const dragCoords = derived(
	// 	liveConnection,
	// 	(currentLiveConnection) => currentLiveConnection?.dragCoordsStore
	// );

	return {
		cables,
		nodes,
		dockedFlavors,
		cursorCoordinates,
		liveConnection
	};
}
