import { ActionType, type ActionHandler } from '@state/actions';
import type { RecipeState } from '@recipe';

const createConnections: ActionHandler<
	ActionType.CreateConnections,
	ActionType.DeleteConnections
> = (state, params) => {
	for (const connection of params.connections) {
		state.connections.set(connection.uuid, connection);
	}

	return {
		state,
		undoAction: {
			type: ActionType.DeleteConnections,
			params: {
				uuids: params.connections.map((connection) => connection.uuid)
			}
		}
	};
};

const updateConnections: ActionHandler<
	ActionType.UpdateConnections,
	ActionType.UpdateConnections
> = (state, params) => {
	const oldConnections = params.connections.map((connection) => {
		const oldConnection = state.connections.get(connection.uuid);
		if (!oldConnection) {
			throw `connection ${connection.uuid} does not exist`;
		}

		state.connections.set(connection.uuid, connection);
		return oldConnection;
	});

	return {
		state,
		undoAction: {
			type: ActionType.UpdateConnections,
			params: { connections: oldConnections }
		}
	};
};

const deleteConnections: ActionHandler<
	ActionType.DeleteConnections,
	ActionType.CreateConnections
> = (state, params) => {
	const connections = params.uuids.map((uuid) => {
		const connection = state.connections.get(uuid);
		if (!connection) throw `connection ${uuid} not found`;

		// delete connection
		state.connections.delete(uuid);

		return connection;
	});

	return {
		state,
		undoAction: {
			type: ActionType.CreateConnections,
			params: { connections }
		}
	};
};

const deleteUsages: ActionHandler<ActionType.DeleteUsages, ActionType.CreateConnections> = (
	state,
	params
) => {
	const connections = [];
	for (const uuid of params.uuids) {
		for (const connection of state.connections.values()) {
			if (connection.inUsageUuid == uuid || connection.outUsageUuid == uuid) {
				// this connection uses this usage
				state.connections.delete(connection.uuid);
				connections.push(connection);
			}
		}
	}

	return {
		state,
		undoAction: { type: ActionType.CreateConnections, params: { connections } }
	};
};

export function registerConnectionHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateConnections, createConnections);
	recipeState.register(ActionType.UpdateConnections, updateConnections);
	recipeState.register(ActionType.DeleteConnections, deleteConnections);
	recipeState.register(ActionType.DeleteUsages, deleteUsages);
}
