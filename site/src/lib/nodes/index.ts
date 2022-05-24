import { derived, type Readable, type Writable, writable } from 'svelte/store';
import type { Direction } from '$lib/common/types';
import type { FlavorType } from '@prisma/client';

export type NodeParameters = {
	[key: string]: any;
};

export type RackState = {
	flavorType: FlavorType;
};

export type RacksState = {
	in: { [flavorName: string]: RackState };
	out: { [flavorName: string]: RackState };
};

export interface DockedState {
	docked: boolean;
	direction?: Direction;
}

export interface NodeState<P extends NodeParameters> {
	ingredientId: string;
	type: string;
	coords: Writable<{
		x: number;
		y: number;
	}>;
	parameters: Writable<P>;
	racks: RacksState;
	dockedStatus: Writable<DockedState>;
}

export const nodesStore: Writable<{ [ingredientId: string]: NodeState<any> }> = writable({});

export const nodesRacksStore: Readable<{ [ingredientId: string]: RacksState }> = derived(
	nodesStore,
	(nodes) => {
		return Object.entries(nodes).reduce((nodesRacks, [ingredientId, node]) => {
			nodesRacks[ingredientId] = node.racks;
			return nodesRacks;
		}, {});
	}
);

export function addNode(node: NodeState<any>) {
	nodesStore.update(($nodes) => {
		$nodes[node.ingredientId] = node;
		return $nodes;
	});
}
export function updateNode(node: NodeState<any>) {
	nodesStore.update(($nodes) => {
		$nodes[node.ingredientId] = node;
		return $nodes;
	});
}

export function removeNode(node: NodeState<any>) {
	nodesStore.update(($nodes) => {
		delete $nodes[node.ingredientId];
		return $nodes;
	});
}

// each dock subscribes to this and does its own checking
export const droppedNodeCoordsStore: Writable<{
	dockedStatusStore: Writable<DockedState>;
	coords: { x: number; y: number };
}> = writable();
