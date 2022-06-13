import type { CallFor, Flavor, Ingredient, Location } from '$lib/common/types';
import { createIngredient } from './createIngredient';

export enum ActionType {
	CreateIngredient,
	DeleteIngredient
}

type ActionParamsMapper = {
	[ActionType.CreateIngredient]: {
		ingredient: Omit<Ingredient, 'uuid'>;
		callFor: Omit<CallFor, 'uuid' | 'ingredientUuid'>;
		location: Omit<Location, 'uuid' | 'callForUuid'>;
		flavors: Omit<Flavor, 'uuid' | 'ingredientUuid'>[];
	};
	[ActionType.DeleteIngredient]: number;
};

export type ActionParams<T> = T extends ActionType ? ActionParamsMapper[T] : never;

export interface Action<T extends ActionType> {
	type: ActionType;
	params: ActionParams<T>;
}

export type EventHandler<E, U extends ActionType> = (params: E) => Action<U>;

const handlers = {
	[ActionType.CreateIngredient]: createIngredient
};

let actions: Action<ActionType>[] = [];
let undoActions: Action<ActionType>[] = [];

export function handleAction<T extends ActionType>(action: { type: T; params: ActionParams<T> }) {
	actions.push(action);

	const actionHandler = handlers[action.type];
	actionHandler(action.params);

	if (undoActions.length) {
		undoActions = [];
	}
}

function undo() {
	const action = actions.pop();
	const undoHandler = handlers[action.type];
	undoHandler(action.params);
	undoActions.push(action);
}

function redo() {
	const action = undoActions.pop();
	const redoHandler = handlers[action.type];
	redoHandler(action.params);
}
