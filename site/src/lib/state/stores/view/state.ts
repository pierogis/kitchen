import { derived, writable, type Writable, type Readable, get } from 'svelte/store';

import {
	Direction,
	type Coordinates,
	type Flavor,
	type FlavorUsage,
	type Ingredient
} from '@types';
import type { RecipeState } from '@recipe';
import { createLiveConnection, type LiveConnectionState } from './liveConnection';
import { createCables, type Cable } from './cables';
import { createNodes, type Node } from './nodes';

import {
	createTerminals,
	type Terminal,
	createTerminalsCoordinates,
	type TerminalsCoordinatesState
} from './terminals';
import { createPayloads, type PayloadsState } from './payloads';

export interface ViewState {
	cables: Readable<Cable[]>;
	focusedIngredient: Readable<Ingredient>;
	nodes: Readable<Node[]>;
	dockedFlavors: Readable<Flavor[]>;
	cursorCoordinates: Writable<Coordinates | undefined>;
	liveConnection: LiveConnectionState;
	liveTerminal: Readable<Terminal | undefined>;
	terminals: Readable<Terminal[]>;
	terminalsCoordinates: TerminalsCoordinatesState;
	payloads: PayloadsState;
}

export function readableViewState(recipeState: RecipeState): ViewState {
	const focusedIngredientUuid = derived(
		[recipeState.usages, recipeState.focusedUsageUuid],
		([$usages, $focusedUsageUuid]) => {
			const usage = $usages.get($focusedUsageUuid);
			if (usage) {
				// return the focused ingredient
				return usage.ingredientUuid;
			} else {
				throw `usage ${$focusedUsageUuid} not found`;
			}
		}
	);

	// get the ingredient that is currently focused
	const focusedIngredient = derived(
		[recipeState.ingredients, focusedIngredientUuid],
		([$ingredients, $focusedIngredientUuid]) => {
			const ingredient = $ingredients.get($focusedIngredientUuid);
			if (ingredient) {
				// return the focused ingredient
				return ingredient;
			} else {
				throw `ingredient ${$focusedIngredientUuid} not found`;
			}
		}
	);

	const cursorCoordinates = writable(undefined);

	// these are connections, ingredient nodes, and flavors that are in the given view
	const inFocusConnections = derived(
		[focusedIngredient, recipeState.connections],
		([$focusedIngredient, $connections]) =>
			Array.from($connections.values()).filter(
				(connection) => connection.parentIngredientUuid == $focusedIngredient.uuid
			)
	);
	const inFocusSubIngredients = derived(
		[focusedIngredient, recipeState.ingredients],
		([$focusedIngredient, $ingredients]) =>
			Array.from($ingredients.values()).filter(
				(ingredient) => ingredient.parentIngredientUuid == $focusedIngredient.uuid
			)
	);
	const inFocusSubUsages = derived(
		[inFocusSubIngredients, recipeState.usages],
		([$inFocusSubIngredients, $usages]) => {
			const currentFocusedSubIngredientUuids = $inFocusSubIngredients.map(
				(ingredient) => ingredient.uuid
			);
			return Array.from($usages.values()).filter((usage) =>
				currentFocusedSubIngredientUuids.includes(usage.ingredientUuid)
			);
		}
	);

	const flavorUsages: Readable<FlavorUsage[]> = derived(
		[recipeState.usages, recipeState.flavors],
		([$usages, $flavors]) => {
			return Array.from($usages.values()).flatMap((usage) => {
				return Array.from($flavors.values())
					.filter((flavor) => flavor.ingredientUuid == usage.ingredientUuid)
					.map((flavor) => {
						return { ...flavor, usageUuid: usage.uuid };
					});
			});
		}
	);

	const inFocusFlavorUsages: Readable<FlavorUsage[]> = derived(
		[inFocusSubIngredients, flavorUsages],
		([$inFocusSubIngredients, $flavorUsages]) => {
			const focusedSubIngedientUuids = $inFocusSubIngredients.reduce<Set<string>>(
				(previous, ingredient) => {
					previous.add(ingredient.uuid);
					return previous;
				},
				new Set()
			);

			return $flavorUsages.filter((flavor) => focusedSubIngedientUuids.has(flavor.ingredientUuid));
		}
	);

	// flavors belonging to the focused ingredient
	const dockedFlavors: Readable<FlavorUsage[]> = derived(
		[recipeState.flavors, focusedIngredient],
		([$flavors, $focusedIngredient]) => {
			return Array.from($flavors.values())
				.filter((flavor) => flavor.ingredientUuid == $focusedIngredient.uuid)
				.flatMap((flavor) =>
					flavor.directions.map<FlavorUsage>((direction) => {
						return {
							uuid: flavor.uuid,
							ingredientUuid: flavor.ingredientUuid,
							type: flavor.type,
							name: flavor.name,
							options: flavor.options,
							directions: direction == Direction.In ? [Direction.Out] : [Direction.In],
							usageUuid: get(recipeState.focusedUsageUuid)
						};
					})
				);
		}
	);

	const liveConnection = createLiveConnection(recipeState, focusedIngredient, dockedFlavors);

	// centrally track terminals that should be created on flavors
	const terminals = createTerminals(
		inFocusConnections,
		inFocusFlavorUsages,
		liveConnection,
		dockedFlavors
	);

	// terminals feed back their location for use with drawing cables
	const terminalsCoordinates = createTerminalsCoordinates(terminals, liveConnection);

	// the live terminal needs to be drawn too
	const liveTerminal: Readable<Terminal | undefined> = derived(
		[liveConnection],
		([currentLiveConnection]) => {
			if (currentLiveConnection) {
				return {
					direction: currentLiveConnection.dragDirection,
					flavorType: currentLiveConnection.flavorType,

					connectionUuid: currentLiveConnection.connectionUuid,
					cabled: true,
					usageUuid: undefined
				};
			}
		}
	);

	// create representations of connections in the current view
	const cables = createCables(terminals, liveTerminal);

	// callsFor/ingredients/nodes in the current view and their components
	const nodes = createNodes(recipeState, inFocusSubIngredients, inFocusSubUsages);

	// centrally track values that go in inputs/monitors so they can be edited from anywhere
	const payloads = createPayloads(recipeState);

	return {
		cables,
		nodes,
		dockedFlavors,
		focusedIngredient,
		cursorCoordinates,
		liveConnection,
		liveTerminal,
		terminals,
		terminalsCoordinates,
		payloads
	};
}
