import { derived, type Readable, get, writable, type Writable } from 'svelte/store';

import * as THREE from 'three';

import {
	type Flavor,
	type FlavorUsage,
	type Ingredient,
	type Usage,
	type FullPrep,
	type PrepType,
	Direction
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

export interface ViewState {
	parentUsageUuid: Readable<string | undefined>;
	focusedIngredient: Readable<Ingredient>;
	nodes: Readable<Node[]>;
	preps: Readable<FullPrep<PrepType>[]>;
	dockedFlavors: Readable<Flavor[]>;
	fillings: FillingsState;
	terminals: Readable<Terminal[]>;
	terminalsCoordinates: TerminalsCoordinatesState;
	liveTerminal: Readable<Terminal | undefined>;
	liveConnection: LiveConnectionState;
	cables: Readable<Cable[]>;
	cursor: CursorState;
	windowSize: Writable<{ width: number; height: number }>;
	mainCamera: Readable<THREE.Camera>;
	editMode: Writable<boolean>;
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

	const parentUsageUuid = derived(
		[recipeState.usages, recipeState.focusedUsageUuid],
		([$usages, $focusedUsageUuid]) => {
			const usage = $usages.get($focusedUsageUuid);
			if (usage) {
				// return the focused ingredient
				return usage.parentUsageUuid;
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

	// centrally track values that go in inputs/monitors so they can be edited from anywhere
	const preps = createPreps(recipeState, focusedIngredientUuid);

	// flavors belonging to the focused ingredient
	const dockedFlavors: Readable<FlavorUsage[]> = derived(
		[recipeState.flavors, recipeState.preps, focusedIngredientUuid],
		([$flavors, $preps, $focusedIngredientUuid]) => {
			const dockedFlavorUsages = Array.from($flavors.values())
				.filter((flavor) => flavor.ingredientUuid == $focusedIngredientUuid)
				.flatMap((flavor) => {
					// filter out directed flavors that are already in preps
					const prep = flavor.prepUuid && $preps.get(flavor.prepUuid);
					if (prep) {
						return [
							{
								uuid: flavor.uuid,
								ingredientUuid: flavor.ingredientUuid,
								prepUuid: flavor.prepUuid,
								type: flavor.type,
								name: flavor.name,
								options: flavor.options,
								directions: flavor.directions,
								usageUuid: undefined
							}
						];
					} else {
						return flavor.directions.map<FlavorUsage>((direction) => {
							return {
								uuid: flavor.uuid,
								ingredientUuid: flavor.ingredientUuid,
								type: flavor.type,
								name: flavor.name,
								options: flavor.options,
								directions: direction == Direction.In ? [Direction.Out] : [Direction.In],
								usageUuid: undefined
							};
						});
					}
				});

			return dockedFlavorUsages;
		}
	);

	const liveConnection = createLiveConnection(recipeState, focusedIngredient, dockedFlavors);

	// callsFor/ingredients/nodes in the current view and their components
	const nodes = createNodes(recipeState, inFocusSubComponents);

	// centrally track terminals that should be created on flavors
	const terminals = createTerminals(inFocusConnections, nodes, liveConnection, dockedFlavors);

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

	// centrally track values that go in inputs/monitors so they can be edited from anywhere
	const fillings = createFillings(recipeState);

	const windowSize: Writable<{ width: number; height: number }> = writable({ width: 0, height: 0 });

	const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
	camera.position.z = 2;

	const mainCamera = writable(camera);

	windowSize.subscribe(($windowSize) => {
		mainCamera.update(($camera) => {
			$camera.aspect = $windowSize.width / $windowSize.height;
			$camera.updateProjectionMatrix();

			return $camera;
		});
	});

	const editMode = writable(false);

	return {
		parentUsageUuid,
		focusedIngredient,
		nodes,
		preps,
		dockedFlavors,
		fillings,
		terminals,
		terminalsCoordinates,
		liveTerminal,
		liveConnection,
		cables,
		cursor,
		windowSize,
		mainCamera,
		editMode
	};
}
