import { type ActionHandler, ActionType } from '@state/actions';

export const createUsage: ActionHandler<ActionType.CreateUsage, ActionType.DeleteUsage> = (
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

export const deleteUsage: ActionHandler<ActionType.DeleteUsage, ActionType.CreateUsage> = (
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
