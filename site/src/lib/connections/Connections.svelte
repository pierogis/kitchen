<script lang="ts">
	import { derived, type Unsubscriber, type Readable, type Writable } from 'svelte/store';

	import { nodesStore } from '$lib/nodes';
	import { allNodesTerminalCentersStore } from '$lib/terminals';
	import { connectionsStore, removeConnection } from '$lib/connections';

	import Cable from '$lib/components/Cable.svelte';
	import LiveConnection from '$lib/connections/LiveConnection.svelte';

	// store to contain 2 (x, y) coords keyed by connectionId
	let connectionsCoordsStore: Readable<{
		[connectionId: string]: {
			in: Writable<{
				x: number;
				y: number;
			}>;
			out: Writable<{
				x: number;
				y: number;
			}>;
		};
	}> = derived(allNodesTerminalCentersStore, (nodesTerminalCenters) => {
		let allCoords = {};
		nodesTerminalCenters.forEach((terminalCenter) => {
			if (terminalCenter.connectionId) {
				if (!allCoords[terminalCenter.connectionId]) {
					allCoords[terminalCenter.connectionId] = { in: null, out: null };
				}
				allCoords[terminalCenter.connectionId][terminalCenter.direction] = terminalCenter.coords;
			}
		});

		return allCoords;
	});

	// need to know when a connection should be deleted
	// this is based on whether its referenced nodes stop existing

	// create derived stores (from nodesStore) that subscribe to call
	// a "check for delete connection" function

	// need to unsubscribe to derived stores so multiple calls
	// aren't registered for the same derived node store
	let unsubscribers: Unsubscriber[] = [];

	$: {
		// call the unsubscribe functions previously set
		unsubscribers.forEach((unsubscriber) => {
			unsubscriber();
		});

		unsubscribers = [];

		// loop each connection
		Object.entries($connectionsStore).forEach(([connectionId, connection]) => {
			let inNodeId = connection.in.ingredientId;
			let outNodeId = connection.out.ingredientId;

			let inParameterName = connection.in.flavorName;
			let outParameterName = connection.out.flavorName;

			// make a derived store with the state of the in node
			let inNode = derived(nodesStore, (nodes) => {
				return nodes[inNodeId];
			});

			// subscribe to changes in the in node's state
			// and remove connection if necessary
			let inUnsubscriber = inNode.subscribe((node) => {
				// node may be removed
				if (node) {
					// type may change
					if (!Object.keys(node.racks.in).includes(inParameterName)) {
						removeConnection(connection.connectionId);
					}
				} else {
					removeConnection(connection.connectionId);
				}
			});

			// do the same for the out node
			let outNode = derived(nodesStore, (nodes) => {
				return nodes[outNodeId];
			});

			let outUnsubscriber = outNode.subscribe((node) => {
				if (node) {
					if (!Object.keys(node.racks.out).includes(outParameterName)) {
						removeConnection(connection.connectionId);
					}
				} else {
					removeConnection(connection.connectionId);
				}
			});

			// add these unsubscribers to this list that will be called
			// next time connectionsStore updates
			unsubscribers.push(inUnsubscriber);
			unsubscribers.push(outUnsubscriber);
		});
	}
</script>

{#each Object.entries($connectionsCoordsStore) as [connectionId, coords] (connectionId)}
	<Cable inCoords={coords.in} outCoords={coords.out} />
{/each}

<LiveConnection />
