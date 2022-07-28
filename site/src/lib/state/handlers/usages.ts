import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';
import { createEntities, deleteEntities } from './common';
import { get } from 'svelte/store';

const createUsages: ActionHandler<ActionType.CreateUsages, ActionType.DeleteUsages> = (
	stores,
	params
) => {
	const usages = createEntities(stores.usages, params.usages);

	return {
		type: ActionType.DeleteUsages,
		params: {
			usages
		}
	};
};

const deleteUsages: ActionHandler<ActionType.DeleteUsages, ActionType.CreateUsages> = (
	stores,
	params
) => {
	deleteEntities(stores.usages, params.usages);

	return {
		type: ActionType.CreateUsages,
		params: {
			usages: params.usages
		}
	};
};

const deleteCallsFor: ActionHandler<ActionType.DeleteCallsFor, ActionType.CreateUsages> = (
	stores,
	params
) => {
	const currentUsages = get(stores.usages);

	const oldUsages = params.callsFor.flatMap((callFor) => {
		const usage = currentUsages.get(callFor.usageUuid);
		return usage ? [usage] : [];
	});

	deleteEntities(stores.usages, oldUsages);

	return {
		type: ActionType.CreateUsages,
		params: { usages: oldUsages }
	};
};

const focusUsage: ActionHandler<ActionType.FocusUsage, ActionType.FocusUsage> = (
	stores,
	params
) => {
	const oldUsageUuid = get(stores.focusedUsageUuid);

	const usage = get(stores.usages).get(params.usageUuid);
	if (!usage) throw `usage ${params.usageUuid} does not exist`;
	stores.focusedUsageUuid.set(usage.uuid);

	return {
		type: ActionType.FocusUsage,
		params: { usageUuid: oldUsageUuid }
	};
};

export function registerUsageHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateUsages, createUsages);
	recipeState.register(ActionType.DeleteUsages, deleteUsages);
	recipeState.register(ActionType.DeleteCallsFor, deleteCallsFor);
	recipeState.register(ActionType.FocusUsage, focusUsage);
}
