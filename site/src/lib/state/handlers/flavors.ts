import { type ActionHandler, ActionType } from '@state/actions';

export const createFlavor: ActionHandler<ActionType.CreateFlavor, ActionType.DeleteFlavor> = (
	state,
	params
) => {
	state.flavors.set(params.flavor.uuid, params.flavor);

	return {
		state,
		undoAction: {
			type: ActionType.DeleteFlavor,
			params: {
				uuid: params.flavor.uuid
			}
		}
	};
};

export const deleteFlavor: ActionHandler<ActionType.DeleteFlavor, ActionType.CreateFlavor> = (
	state,
	params
) => {
	// delete flavors
	const flavor = state.flavors.get(params.uuid);
	if (!flavor) throw `Flavor ${params.uuid} does not exist`;
	state.flavors.delete(params.uuid);

	return {
		state,
		undoAction: { type: ActionType.CreateFlavor, params: { flavor } }
	};
};
