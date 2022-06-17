import { derived, writable, type Writable, type Readable } from 'svelte/store';

import type { Flavor } from '$lib/common/types';
import type { RecipeState } from '$lib/state/stores/recipe';
import { createLiveConnection, type LiveConnectionState } from './liveConnection';
import { createCables, type Cable } from './cables';
import { createNodes, type Node } from './nodes';
import {
	createTerminalCoordinates,
	type Terminal,
	type TerminalCoordinatesState
} from './terminals';
import { createTerminals } from '.';

export type Coordinates = { x: number; y: number };

export interface ViewState {
	cables: Readable<Cable[]>;
	nodes: Readable<Node[]>;
	dockedFlavors: Readable<Flavor[]>;
	cursorCoordinates: Writable<Coordinates | undefined>;
	liveConnection: LiveConnectionState;
	liveTerminal: Readable<Terminal | undefined>;
	terminals: Readable<Terminal[]>;
	terminalCoordinates: TerminalCoordinatesState;
}

export function readableViewState(recipeState: RecipeState): ViewState {
	// get the ingredient that is currently focused
	const focusedIngredient = derived(
		[recipeState.ingredients, recipeState.focusedIngredientUuid],
		([currentIngredients, currentFocusedIngredientUuid]) => {
			const ingredient = currentIngredients.get(currentFocusedIngredientUuid);
			if (ingredient) {
				// return the focused ingredient
				return ingredient;
			} else {
				throw `Ingredient ${currentFocusedIngredientUuid} not found`;
			}
		}
	);

	const cursorCoordinates = writable(undefined);

	const liveConnection = createLiveConnection(recipeState, focusedIngredient);

	const focusedConnections = derived(
		[focusedIngredient, recipeState.connections],
		([currentFocusedIngredient, currentConnections]) =>
			Array.from(currentConnections.values()).filter(
				(connection) => connection.parentIngredientUuid == currentFocusedIngredient.uuid
			)
	);
	const focusedSubIngredients = derived(
		[focusedIngredient, recipeState.ingredients],
		([currentFocusedIngredient, currentIngredients]) =>
			Array.from(currentIngredients.values()).filter(
				(ingredient) => ingredient.parentIngredientUuid == currentFocusedIngredient.uuid
			)
	);
	const focusedFlavors = derived(
		[focusedSubIngredients, recipeState.flavors],
		([currentFocusedSubIngredients, currentFlavors]) => {
			const focusedSubIngedientUuids = currentFocusedSubIngredients.reduce<Set<string>>(
				(previous, ingredient) => {
					previous.add(ingredient.uuid);
					return previous;
				},
				new Set()
			);

			return Array.from(currentFlavors.values()).filter((flavor) =>
				focusedSubIngedientUuids.has(flavor.ingredientUuid)
			);
		}
	);

	const terminals = createTerminals(focusedConnections, focusedFlavors, liveConnection);

	const liveTerminal: Readable<Terminal | undefined> = derived(
		[liveConnection],
		([currentLiveConnection]) => {
			if (currentLiveConnection) {
				return {
					direction: currentLiveConnection.dragDirection,
					flavorType: currentLiveConnection.flavorType,

					connectionUuid: currentLiveConnection.connectionUuid,
					cabled: true
				};
			}
		}
	);

	// create representations of connections in the current view
	const cables = createCables(recipeState, terminals, liveTerminal);

	// callsFor/ingredients/nodes in the current view and their components
	const nodes = createNodes(recipeState, focusedSubIngredients);

	// flavors belonging to the focused ingredient
	const dockedFlavors = derived(
		[recipeState.flavors, focusedIngredient],
		([currentFlavors, currentFocusedIngredient]) => {
			return Array.from(currentFlavors.values()).filter(
				(flavor) => flavor.ingredientUuid == currentFocusedIngredient.uuid
			);
		}
	);

	const terminalCoordinates = createTerminalCoordinates();

	return {
		cables,
		nodes,
		dockedFlavors,
		cursorCoordinates,
		liveConnection,
		liveTerminal,
		terminals,
		terminalCoordinates
	};
}
