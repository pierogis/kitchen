import { get } from 'svelte/store';

import type { CallFor, Location } from '@types';

import { type Action, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';

export function dispatchDeleteCallForActions(recipeState: RecipeState, callFor: CallFor) {
	const callForAction: Action<ActionType.DeleteCallFor> = {
		type: ActionType.DeleteCallFor,
		params: { uuid: callFor.uuid }
	};

	const usageAction: Action<ActionType.DeleteUsage> = {
		type: ActionType.DeleteUsage,
		params: { uuid: callFor.usageUuid }
	};

	const actions: Action<ActionType>[] = [callForAction, usageAction];

	const location: Location | undefined = Array.from(get(recipeState.locations).values()).find(
		(location) => location.callForUuid == callFor.uuid
	);
	if (location) {
		const locationAction: Action<ActionType.DeleteLocation> = {
			type: ActionType.DeleteLocation,
			params: {
				uuid: location.uuid
			}
		};

		actions.push(locationAction);
	}

	recipeState.batchDispatch(actions);
}
