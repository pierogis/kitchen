import type { Writable } from 'svelte/store';

import type { ActionType, Action, ActionHandler } from '$state/actions';
import type { FlatRecipe } from '$recipe';

export function dispatcher(stores: {
	[key in keyof FlatRecipe]: Writable<FlatRecipe[key]>;
}) {
	const undoActions: Action<ActionType>[][] = [];
	let redoActions: Action<ActionType>[][] = [];

	let lastId = 1;
	const handlers: {
		[key: string]: {
			type: ActionType;
			handler: ActionHandler<any, any>;
		};
	} = {};

	function handleActions<T extends ActionType>(actions: Action<T>[]): Action<ActionType>[] {
		const newUndoActions: Action<ActionType>[] = [];

		for (const action of actions) {
			for (const id in handlers) {
				if (handlers[id].type == action.type) {
					const undoAction = handlers[id].handler(stores, action.params);

					newUndoActions.push(undoAction);
				}
			}
		}

		return newUndoActions;
	}

	function register<T extends ActionType, U extends ActionType>(
		type: T,
		handler: ActionHandler<T, U>
	) {
		const id = lastId++;
		handlers[id] = { type, handler };
		return id;
	}

	function dispatch<T extends ActionType>(action: Action<T>) {
		undoActions.push(handleActions([action]));

		if (undoActions.length) {
			redoActions = [];
		}
	}

	function batchDispatch<T extends ActionType>(actions: Action<T>[]) {
		undoActions.push(handleActions(actions));

		if (undoActions.length) {
			redoActions = [];
		}
	}

	function undo() {
		const actions = undoActions.pop();
		if (actions) {
			redoActions.push(handleActions(actions));
		}
	}

	function redo() {
		const actions = redoActions.pop();
		if (actions) {
			undoActions.push(handleActions(actions));
		}
	}

	return {
		register,
		dispatch,
		batchDispatch,
		undo,
		redo
	};
}
