import { derived, type Readable, get } from 'svelte/store';

import {
	Direction,
	type Flavor,
	type FlavorUsage,
	type Ingredient,
	type Usage,
	type FullPrep,
	PrepType
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
import { createFillings, type FillingsState } from './fillings';
import { createCursor, type CursorState } from './cursor';
import { createPreps } from './preps';
import { prepPrimitives } from '$lib/common/preps';

export interface ViewState {
	cables: Readable<Cable[]>;
	focusedIngredient: Readable<Ingredient>;
	nodes: Readable<Node[]>;
	dockedFlavors: Readable<Flavor[]>;
	cursor: CursorState;
	liveConnection: LiveConnectionState;
	liveTerminal: Readable<Terminal | undefined>;
	terminals: Readable<Terminal[]>;
	terminalsCoordinates: TerminalsCoordinatesState;
	fillings: FillingsState;
	preps: Readable<FullPrep[]>;
}

// dont use the derived properties thing for recipe store
// update pulse on action
// view state derives from this update pulse

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
	const focusedIngredient = derived(focusedIngredientUuid, ($focusedIngredientUuid) => {
		const currentIngredients = get(recipeState.ingredients);
		const ingredient = currentIngredients.get($focusedIngredientUuid);
		if (ingredient) {
			// return the focused ingredient
			return ingredient;
		} else {
			throw `ingredient ${$focusedIngredientUuid} not found`;
		}
	});

	const cursor = createCursor();

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
	const inFocusSubComponents: Readable<{ usage: Usage; ingredient: Ingredient }[]> = derived(
		[recipeState.usages, recipeState.ingredients, focusedIngredientUuid],
		([$usages, $ingredients, $focusedIngredientUuid]) => {
			return Array.from($usages.values()).flatMap((usage) => {
				const ingredient = $ingredients.get(usage.ingredientUuid);

				return ingredient && ingredient.parentIngredientUuid == $focusedIngredientUuid
					? [{ ingredient, usage }]
					: [];
			});
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

	// centrally track values that go in inputs/monitors so they can be edited from anywhere
	const preps = createPreps(recipeState, focusedIngredientUuid);

	// flavors belonging to the focused ingredient
	const dockedFlavors: Readable<FlavorUsage[]> = derived(
		[recipeState.flavors, recipeState.preps, focusedIngredientUuid],
		([$flavors, $preps, $focusedIngredientUuid]) => {
			const focusedUsageUuid = get(recipeState.focusedUsageUuid);
			return Array.from($flavors.values())
				.filter((flavor) => flavor.ingredientUuid == $focusedIngredientUuid)
				.flatMap((flavor) =>
					flavor.directions.flatMap<FlavorUsage>((direction) => {
						// filter out directed flavors that are already in preps
						const prep = flavor.prepUuid && $preps.get(flavor.prepUuid);
						const prepFlavorEntry =
							prep &&
							Object.entries(prep.flavorMap).find(
								([_prepFlavorName, flavorUuid]) => flavorUuid == flavor.uuid
							);
						const directedFlavorInPrep =
							prepFlavorEntry &&
							prepPrimitives[prep.type].flavors[prepFlavorEntry[0]].directions.includes(direction);
						if (directedFlavorInPrep) {
							return [];
						} else {
							return [
								{
									uuid: flavor.uuid,
									ingredientUuid: flavor.ingredientUuid,
									type: flavor.type,
									name: flavor.name,
									options: flavor.options,
									directions: direction == Direction.In ? [Direction.Out] : [Direction.In],
									usageUuid: undefined
								}
							];
						}
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
		preps,
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
	const nodes = createNodes(recipeState, inFocusSubComponents);

	// centrally track values that go in inputs/monitors so they can be edited from anywhere
	const fillings = createFillings(recipeState);

	return {
		cables,
		nodes,
		dockedFlavors,
		focusedIngredient,
		cursor,
		liveConnection,
		liveTerminal,
		terminals,
		terminalsCoordinates,
		fillings,
		preps
	};
}
