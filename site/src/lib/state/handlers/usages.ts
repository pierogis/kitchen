import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';

const createUsage: ActionHandler<ActionType.CreateUsage, ActionType.DeleteUsage> = (
	state,
	params
) => {
	state.usages.set(params.usage.uuid, params.usage);

	return {
		state,
		undoAction: {
			type: ActionType.DeleteUsage,
			params: {
				uuid: params.usage.uuid
			}
		}
	};
};

const deleteUsage: ActionHandler<ActionType.DeleteUsage, ActionType.CreateUsage> = (
	state,
	params
) => {
	// delete usage
	const usage = state.usages.get(params.uuid);
	if (!usage) throw `usage ${params.uuid} not found`;
	state.usages.delete(params.uuid);

	return {
		state,
		undoAction: { type: ActionType.CreateUsage, params: { usage } }
	};
};

export function registerUsageHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateUsage, createUsage);
	recipeState.register(ActionType.DeleteUsage, deleteUsage);
}
