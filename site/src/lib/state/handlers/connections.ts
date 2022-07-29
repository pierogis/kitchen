import { get } from 'svelte/store';

import { ActionType, type ActionHandler } from '@state/actions';
import type { RecipeState } from '@recipe';

import { createEntities, deleteEntities, updateEntities } from './common';
import type { Connection } from '$lib/common/types';

const createConnections: ActionHandler<
	ActionType.CreateConnections,
	ActionType.DeleteConnections
> = (stores, params) => {
	const connections = createEntities(stores.connections, params.connections);

	return {
		type: ActionType.DeleteConnections,
		params: {
			connections
		}
	};
};

const updateConnections: ActionHandler<
	ActionType.UpdateConnections,
	ActionType.UpdateConnections
> = (stores, params) => {
	const oldConnections = updateEntities(stores.connections, params.connections);

	return {
		type: ActionType.UpdateConnections,
		params: { connections: oldConnections }
	};
};

const deleteConnections: ActionHandler<
	ActionType.DeleteConnections,
	ActionType.CreateConnections
> = (stores, params) => {
	deleteEntities(stores.connections, params.connections);

	return {
		type: ActionType.CreateConnections,
		params: { connections: params.connections }
	};
};

const deleteCallsFor: ActionHandler<ActionType.DeleteCallsFor, ActionType.CreateConnections> = (
	stores,
	params
) => {
	const connections: Connection[] = [];
	const currentConnections = get(stores.connections);
	for (const callFor of params.callsFor) {
		for (const connection of currentConnections.values()) {
			if (
				connection.inUsageUuid == callFor.usageUuid ||
				connection.outUsageUuid == callFor.usageUuid
			) {
				// this connection uses this usage
				connections.push(connection);
			}
		}
	}

	deleteEntities(stores.connections, connections);

	return { type: ActionType.CreateConnections, params: { connections } };
};

export function registerConnectionHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateConnections, createConnections);
	recipeState.register(ActionType.UpdateConnections, updateConnections);
	recipeState.register(ActionType.DeleteConnections, deleteConnections);
	recipeState.register(ActionType.DeleteCallsFor, deleteCallsFor);
}
