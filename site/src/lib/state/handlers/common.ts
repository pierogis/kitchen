import type { Writable } from 'svelte/store';

export function createEntities<T extends { uuid: string }>(
	store: Writable<Map<string, T>>,
	entities: T[]
) {
	let uuids: string[] = [];
	store.update(($store) => {
		uuids = entities.map((entity) => {
			$store.set(entity.uuid, entity);
			return entity.uuid;
		});

		return $store;
	});

	return uuids;
}

export function updateEntities<T extends { uuid: string }>(
	store: Writable<Map<string, T>>,
	entities: T[]
) {
	let oldEntities: T[] = [];
	store.update(($store) => {
		oldEntities = entities.map((entity) => {
			const oldEntity = $store.get(entity.uuid);
			if (!oldEntity) {
				throw `entity ${entity.uuid} does not exist`;
			}

			$store.set(entity.uuid, entity);
			return oldEntity;
		});

		return $store;
	});

	return oldEntities;
}

export function deleteEntities<T extends { uuid: string }>(
	store: Writable<Map<string, T>>,
	uuids: string[]
) {
	let deletedEntities: T[] = [];
	store.update(($store) => {
		deletedEntities = uuids.map((uuid) => {
			const entity = $store.get(uuid);
			if (!entity) throw `entity ${uuid} not found`;

			// delete connection
			$store.delete(uuid);

			return entity;
		});

		return $store;
	});

	return deletedEntities;
}
