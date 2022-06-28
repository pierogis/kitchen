import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';

const createFlavors: ActionHandler<ActionType.CreateFlavors, ActionType.DeleteFlavors> = (
	state,
	params
) => {
	const uuids = params.flavors.map((flavor) => {
		state.flavors.set(flavor.uuid, flavor);

		return flavor.uuid;
	});

	return {
		state,
		undoAction: {
			type: ActionType.DeleteFlavors,
			params: {
				uuids
			}
		}
	};
};

const deleteFlavors: ActionHandler<ActionType.DeleteFlavors, ActionType.CreateFlavors> = (
	state,
	params
) => {
	const flavors = params.uuids.map((uuid) => {
		const flavor = state.flavors.get(uuid);
		if (!flavor) throw `flavor ${uuid} does not exist`;

		// delete flavor
		state.flavors.delete(uuid);

		return flavor;
	});

	return {
		state,
		undoAction: { type: ActionType.CreateFlavors, params: { flavors } }
	};
};

export function registerFlavorHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateFlavors, createFlavors);
	recipeState.register(ActionType.DeleteFlavors, deleteFlavors);
}
