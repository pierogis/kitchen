import { derived, type Readable } from 'svelte/store';

import { prepPrimitives } from '$lib/common/preps';
import type { Flavor, FullPrep, PrepType } from '$types';
import type { RecipeState } from '$recipe';

export function createPreps(recipeState: RecipeState, focusedIngredientUuid: Readable<string>) {
	// preps belonging to the focused ingredient
	const preps: Readable<FullPrep<PrepType>[]> = derived(
		[recipeState.preps, recipeState.flavors, focusedIngredientUuid],
		([$preps, $flavors, $focusedIngredientUuid]) => {
			const preps = Array.from($preps.values()).filter(
				(prep) => prep.ingredientUuid == $focusedIngredientUuid
			);

			const prepFlavors = preps.map((prep) => {
				const flavors = Object.keys(prepPrimitives[prep.type].flavors).reduce<Flavor[]>(
					(previous, flavorName) => {
						const flavorUuid: string =
							prep.inFlavorUuidMap[flavorName as keyof typeof prep.inFlavorUuidMap] ||
							prep.outFlavorUuidMap[flavorName as keyof typeof prep.outFlavorUuidMap];
						if (!previous.some((flavor) => flavor.uuid == flavorUuid)) {
							const prepFlavor = $flavors.get(flavorUuid);
							if (!prepFlavor) throw `flavor ${flavorUuid} for prep ${prep.uuid} not found`;

							previous.push(prepFlavor);
						}

						return previous;
					},
					[]
				);
				return { ...prep, flavors };
			});

			return prepFlavors;
		}
	);

	return preps;
}
