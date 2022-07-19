import type { Writable } from 'svelte/store';

export function createEntities<T extends { uuid: string }>(
	store: Writable<Map<string, T>>,
	entities: T[]
) {
	store.update(($store) => {
		entities.forEach((entity) => {
			$store.set(entity.uuid, entity);
		});

		return $store;
	});

	return entities;
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
	entities: T[]
) {
	store.update(($store) => {
		entities.forEach((entity) => {
			// delete entitys
			$store.delete(entity.uuid);
		});

		return $store;
	});
}
