import type { ActionType, Action, ActionHandler } from './actions';

import type { FlatRecipe } from '$lib/state/stores/recipe';
import type { Writable } from 'svelte/store';

export function dispatcher(recipeState: Writable<FlatRecipe>) {
	let undoActions: Action<ActionType>[][] = [];
	const redoActions: Action<ActionType>[][] = [];

	let lastId = 1;
	const handlers: {
		[key: string]: {
			type: ActionType;
			handler: ActionHandler<any, any>;
		};
	} = {};

	function handleAction<T extends ActionType>(action: Action<T>) {
		const newUndoActions: Action<ActionType>[] = [];
		const currentActionHandlers: ActionHandler<ActionType, ActionType>[] = [];
		for (const id in handlers) {
			if (handlers[id].type == action.type) {
				currentActionHandlers.push(handlers[id].handler);
			}
		}
		if (currentActionHandlers.length > 0) {
			recipeState.update((currentState) => {
				for (const handler of currentActionHandlers) {
					const { state: updatedState, undoAction } = handler(currentState, action.params);
					currentState = updatedState;
					newUndoActions.push(undoAction);
				}

				return currentState;
			});
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
		undoActions.push(handleAction(action));

		if (undoActions.length) {
			undoActions = [];
		}
	}

	function undo() {
		const actions = undoActions.pop();
		if (actions) {
			redoActions.push(
				actions
					.map((action) => {
						return handleAction(action);
					})
					.flat()
			);
		}
	}

	function redo() {
		const actions = redoActions.pop();
		if (actions) {
			undoActions.push(
				actions
					.map((action) => {
						return handleAction(action);
					})
					.flat()
			);
		}
	}

	return {
		register,
		dispatch,
		undo,
		redo
	};
}
