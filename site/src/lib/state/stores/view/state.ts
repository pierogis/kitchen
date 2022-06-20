import { derived, writable, type Writable, type Readable } from 'svelte/store';

import { Direction, type Flavor } from '@types';
import type { RecipeState } from '@recipe';
import { createLiveConnection, type LiveConnectionState } from './liveConnection';
import { createCables, type Cable } from './cables';
import { createNodes, type Node } from './nodes';

import {
	type Terminal,
	createTerminalsCoordinates,
	type TerminalsCoordinatesState
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
	terminalsCoordinates: TerminalsCoordinatesState;
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

	// flavors belonging to the focused ingredient
	const dockedFlavors: Readable<Flavor[]> = derived(
		[recipeState.flavors, focusedIngredient],
		([currentFlavors, currentFocusedIngredient]) => {
			return Array.from(currentFlavors.values())
				.filter((flavor) => flavor.ingredientUuid == currentFocusedIngredient.uuid)
				.flatMap((flavor) =>
					flavor.directions.map<Flavor>((direction) => {
						return {
							uuid: flavor.uuid,
							ingredientUuid: flavor.ingredientUuid,
							type: flavor.type,
							name: flavor.name,
							options: flavor.options,
							directions: direction == Direction.In ? [Direction.Out] : [Direction.In]
						};
					})
				);
		}
	);

	const terminals = createTerminals(
		focusedConnections,
		focusedFlavors,
		liveConnection,
		dockedFlavors
	);

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

	const terminalsCoordinates = createTerminalsCoordinates(terminals, liveConnection);

	return {
		cables,
		nodes,
		dockedFlavors,
		cursorCoordinates,
		liveConnection,
		liveTerminal,
		terminals,
		terminalsCoordinates
	};
}
