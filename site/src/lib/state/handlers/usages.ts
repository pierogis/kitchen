import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';
import { createEntities, deleteEntities } from './common';
import { get } from 'svelte/store';

const createUsages: ActionHandler<ActionType.CreateUsages, ActionType.DeleteUsages> = (
	stores,
	params
) => {
	const uuids = createEntities(stores.usages, params.usages);

	return {
		type: ActionType.DeleteUsages,
		params: {
			uuids
		}
	};
};

const deleteUsages: ActionHandler<ActionType.DeleteUsages, ActionType.CreateUsages> = (
	stores,
	params
) => {
	const usages = deleteEntities(stores.usages, params.uuids);

	return {
		type: ActionType.CreateUsages,
		params: {
			usages
		}
	};
};

const focusUsage: ActionHandler<ActionType.FocusUsage, ActionType.FocusUsage> = (
	stores,
	params
) => {
	const oldUsageUuid = get(stores.focusedUsageUuid);

	const usage = get(stores.usages).get(params.uuid);
	if (!usage) throw `usage ${params.uuid} does not exist`;
	stores.focusedUsageUuid.set(usage.uuid);

	return {
		type: ActionType.FocusUsage,
		params: { uuid: oldUsageUuid }
	};
};

export function registerUsageHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateUsages, createUsages);
	recipeState.register(ActionType.DeleteUsages, deleteUsages);
	recipeState.register(ActionType.FocusUsage, focusUsage);
}
