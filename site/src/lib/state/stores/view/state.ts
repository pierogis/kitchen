import { derived, writable, type Writable, type Readable } from 'svelte/store';

import { Direction, type Flavor } from '$lib/common/types';
import type { RecipeState } from '$lib/state/stores/recipe';
import { createLiveConnection, type LiveConnectionState } from './liveConnection';
import { createCables, type Cable } from './cables';
import { createNodes, type Node } from './nodes';
import type { Terminal } from './terminals';

export type Coordinates = { x: number; y: number };

export interface ViewState {
	cables: Readable<Cable[]>;
	nodes: Readable<Node[]>;
	dockedFlavors: Readable<Flavor[]>;
	cursorCoordinates: Writable<Coordinates>;
	liveConnection: LiveConnectionState;
	liveTerminal: Readable<Terminal | undefined>;
}

export function readableViewState(recipeState: RecipeState): ViewState {
	// get all callsFor that are part of the "recipe" for the focused callFor
	const focusedCallsFor = derived(
		[recipeState.callsFor, recipeState.focusedCallForUuid],
		([currentCallsFor, currentFocusedCallForUuid]) => {
			return Array.from(currentCallsFor.values()).filter(
				(callFor) => callFor.parentCallForUuid == currentFocusedCallForUuid
			);
		}
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

	const cursorCoordinates = writable({ x: 0, y: 0 });

	const liveConnection = createLiveConnection(recipeState, focusedIngredient, cursorCoordinates);

	// create representations of connections in the current view
	const cables = createCables(recipeState, focusedIngredient, liveConnection);

	// callsFor/ingredients/nodes in the current view and their components
	const nodes = createNodes(recipeState, focusedCallsFor);

	// flavors belonging to the focused ingredient
	const dockedFlavors = derived(
		[recipeState.flavors, focusedIngredient],
		([currentFlavors, currentFocusedIngredient]) => {
			return Array.from(currentFlavors.values()).filter(
				(flavor) => flavor.ingredientUuid == currentFocusedIngredient.uuid
			);
		}
	);

	const liveTerminal: Readable<Terminal | undefined> = derived(
		[cables, liveConnection],
		([currentCables, currentLiveConnection]) => {
			if (currentLiveConnection) {
				const liveCable = currentCables.find(
					(cable) => cable.connectionUuid == currentLiveConnection.connectionUuid
				);

				if (liveCable) {
					return {
						direction: currentLiveConnection.dragDirection,
						flavorType: currentLiveConnection.flavorType,
						coordinates:
							currentLiveConnection.dragDirection == Direction.In
								? liveCable.inCoordinates
								: liveCable.outCoordinates,
						connectionUuid: currentLiveConnection.connectionUuid,
						cabled: true
					};
				}
			}
		}
	);

	return {
		cables,
		nodes,
		dockedFlavors,
		cursorCoordinates,
		liveConnection,
		liveTerminal
	};
}
