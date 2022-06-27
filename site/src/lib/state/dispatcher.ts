import type { Writable } from 'svelte/store';

import type { ActionType, Action, ActionHandler } from '@state/actions';
import type { FlatRecipe } from '@recipe';

export function dispatcher(recipeState: Writable<FlatRecipe>) {
	let undoActions: Action<ActionType>[][] = [];
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

		recipeState.update((currentState) => {
			for (const action of actions) {
				for (const id in handlers) {
					if (handlers[id].type == action.type) {
						const { state: updatedState, undoAction } = handlers[id].handler(
							currentState,
							action.params
						);

						currentState = updatedState;
						newUndoActions.push(undoAction);
					}
				}
			}

			return currentState;
		});

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
