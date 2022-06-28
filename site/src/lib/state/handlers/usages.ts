import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';

const createUsages: ActionHandler<ActionType.CreateUsages, ActionType.DeleteUsages> = (
	state,
	params
) => {
	const uuids = params.usages.map((usage) => {
		state.usages.set(usage.uuid, usage);

		return usage.uuid;
	});

	return {
		state,
		undoAction: {
			type: ActionType.DeleteUsages,
			params: {
				uuids
			}
		}
	};
};

const deleteUsages: ActionHandler<ActionType.DeleteUsages, ActionType.CreateUsages> = (
	state,
	params
) => {
	const usages = params.uuids.map((uuid) => {
		const usage = state.usages.get(uuid);
		if (!usage) throw 'usage ${uuid} does not exist';

		// delete usage
		state.usages.delete(uuid);
		return usage;
	});

	return {
		state,
		undoAction: { type: ActionType.CreateUsages, params: { usages } }
	};
};

export function registerUsageHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateUsages, createUsages);
	recipeState.register(ActionType.DeleteUsages, deleteUsages);
}
