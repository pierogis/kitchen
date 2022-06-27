import { ActionType, type ActionHandler } from '@state/actions';
import type { RecipeState } from '@recipe';

const createConnection: ActionHandler<ActionType.CreateConnection, ActionType.DeleteConnection> = (
	state,
	params
) => {
	state.connections.set(params.connection.uuid, params.connection);

	return {
		state,
		undoAction: {
			type: ActionType.DeleteConnection,
			params: {
				uuid: params.connection.uuid
			}
		}
	};
};

const updateConnection: ActionHandler<ActionType.UpdateConnection, ActionType.UpdateConnection> = (
	state,
	params
) => {
	const oldConnection = state.connections.get(params.connection.uuid);
	if (!oldConnection) {
		throw `Connection ${params.connection.uuid} does not exist`;
	}

	state.connections.set(params.connection.uuid, params.connection);
	return {
		state,
		undoAction: {
			type: ActionType.UpdateConnection,
			params: { connection: oldConnection }
		}
	};
};

const deleteConnection: ActionHandler<ActionType.DeleteConnection, ActionType.CreateConnection> = (
	state,
	params
) => {
	// delete callFor
	const connection = state.connections.get(params.uuid);

	if (connection) {
	} else {
		throw `Connection ${params.uuid} does not exist`;
	}
	state.connections.delete(connection.uuid);

	return {
		state,
		undoAction: {
			type: ActionType.CreateConnection,
			params: { connection }
		}
	};
};

export function registerConnectionHandlers(recipeState: RecipeState) {
	recipeState.register(ActionType.CreateConnection, createConnection);
	recipeState.register(ActionType.CreateConnection, createConnection);
	recipeState.register(ActionType.DeleteConnection, deleteConnection);
}
