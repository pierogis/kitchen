import { v4 as uuid } from 'uuid';

import type { Connection } from '$lib/common/types';
import { ActionType, type ActionHandler } from '$lib/state/actions';

export const createConnection: ActionHandler<
	ActionType.CreateConnection,
	ActionType.DeleteConnection
> = (state, params) => {
	const connnection: Connection = {
		uuid: params.uuid || uuid(),
		parentIngredientUuid: params.parentIngredientUuid,
		inFlavorUuid: params.inFlavorUuid,
		outFlavorUuid: params.outFlavorUuid,
		flavorType: params.flavorType
	};

	state.connections.set(connnection.uuid, connnection);

	return {
		state,
		undoAction: {
			type: ActionType.DeleteConnection,
			params: {
				connectionUuid: params.uuid
			}
		}
	};
};

export const updateConnection: ActionHandler<
	ActionType.UpdateConnection,
	ActionType.UpdateConnection
> = (state, params) => {
	const oldConnection = state.connections.get(params.uuid);
	if (!oldConnection) {
		throw `Connection ${params.uuid} does not exist`;
	}

	state.connections.set(params.uuid, params);
	return {
		state,
		undoAction: {
			type: ActionType.UpdateConnection,
			params: oldConnection
		}
	};
};

export const deleteConnection: ActionHandler<
	ActionType.DeleteConnection,
	ActionType.CreateConnection
> = (state, params) => {
	// delete callFor
	const connection = state.connections.get(params.connectionUuid);

	if (connection) {
	} else {
		throw `Connection ${params.connectionUuid} does not exist`;
	}
	state.connections.delete(connection.uuid);

	return {
		state,
		undoAction: {
			type: ActionType.CreateConnection,
			params: connection
		}
	};
};
