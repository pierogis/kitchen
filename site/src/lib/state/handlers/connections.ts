import { get } from 'svelte/store';

import { ActionType, type ActionHandler } from '@state/actions';
import type { RecipeState } from '@recipe';

import { createEntities, deleteEntities, updateEntities } from './common';

const createConnections: ActionHandler<
	ActionType.CreateConnections,
	ActionType.DeleteConnections
> = (stores, params) => {
	const uuids = createEntities(stores.connections, params.connections);

	return {
		type: ActionType.DeleteConnections,
		params: {
			uuids
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
	const deletedConnections = deleteEntities(stores.connections, params.uuids);

	return {
		type: ActionType.CreateConnections,
		params: { connections: deletedConnections }
	};
};

const deleteUsages: ActionHandler<ActionType.DeleteUsages, ActionType.CreateConnections> = (
	stores,
	params
) => {
	const connectionUuids: string[] = [];
	const currentConnections = get(stores.connections);
	for (const uuid of params.uuids) {
		for (const connection of currentConnections.values()) {
			if (connection.inUsageUuid == uuid || connection.outUsageUuid == uuid) {
				// this connection uses this usage
				connectionUuids.push(connection.uuid);
			}
		}
	}

	const deletedConnections = deleteEntities(stores.connections, connectionUuids);

	return { type: ActionType.CreateConnections, params: { connections: deletedConnections } };
};

export function registerConnectionHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateConnections, createConnections);
	recipeState.register(ActionType.UpdateConnections, updateConnections);
	recipeState.register(ActionType.DeleteConnections, deleteConnections);
	recipeState.register(ActionType.DeleteUsages, deleteUsages);
}
