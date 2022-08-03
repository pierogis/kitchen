import { get } from 'svelte/store';

import { type ActionHandler, ActionType } from '@state/actions';
import type { RecipeState } from '@recipe';
import type { FlavorType, Parameter } from '@types';

import { createEntities, deleteEntities, updateEntities } from './common';

const createParameters: ActionHandler<ActionType.CreateParameters, ActionType.DeleteParameters> = (
	stores,
	params
) => {
	const parameters = createEntities(stores.parameters, params.parameters);

	return {
		type: ActionType.DeleteParameters,
		params: {
			parameters
		}
	};
};

const updateParameters: ActionHandler<ActionType.UpdateParameters, ActionType.UpdateParameters> = (
	stores,
	params
) => {
	const oldParameters = updateEntities(stores.parameters, params.parameters);

	return {
		type: ActionType.UpdateParameters,
		params: { parameters: oldParameters }
	};
};

const deleteParameters: ActionHandler<ActionType.DeleteParameters, ActionType.CreateParameters> = (
	stores,
	params
) => {
	deleteEntities(stores.parameters, params.parameters);

	return {
		type: ActionType.CreateParameters,
		params: {
			parameters: params.parameters
		}
	};
};

const createConnections: ActionHandler<
	ActionType.CreateConnections,
	ActionType.CreateParameters
> = (stores, params) => {
	const parameters: Parameter<FlavorType>[] = [];
	const currentParameters = get(stores.parameters);

	for (const connection of params.connections) {
		for (const parameter of currentParameters.values()) {
			const sameInFlavorUsage =
				parameter.flavorUuid == connection.inFlavorUuid &&
				parameter.usageUuid == connection.inUsageUuid;
			if (sameInFlavorUsage) {
				// this connection uses this usage
				parameters.push(parameter);
			}
		}
	}

	deleteEntities(stores.parameters, parameters);

	return {
		type: ActionType.CreateParameters,
		params: {
			parameters
		}
	};
};

const updateFlavors: ActionHandler<ActionType.UpdateFlavors, ActionType.CreateParameters> = (
	stores,
	params
) => {
	const parameters: Parameter<FlavorType>[] = [];
	const currentParameters = get(stores.parameters);

	for (const flavor of params.flavors) {
		for (const parameter of currentParameters.values()) {
			const sameInFlavorUsage = parameter.flavorUuid == flavor.uuid;
			if (sameInFlavorUsage && flavor.type != parameter.payload.type) {
				// this connection uses this usage
				parameters.push(parameter);
			}
		}
	}

	deleteEntities(stores.parameters, parameters);

	return {
		type: ActionType.CreateParameters,
		params: {
			parameters
		}
	};
};

export function registerParameterHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateParameters, createParameters);
	recipeState.register(ActionType.UpdateParameters, updateParameters);
	recipeState.register(ActionType.DeleteParameters, deleteParameters);
	recipeState.register(ActionType.CreateConnections, createConnections);
	recipeState.register(ActionType.UpdateFlavors, updateFlavors);
}
