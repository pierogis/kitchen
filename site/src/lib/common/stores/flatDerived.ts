import { derived, readable, type Readable, type Unsubscriber } from 'svelte/store';

export function flatDerived<T>(store: Readable<Readable<T[]>[]>) {
	// could add mapper callback param to map flavor => flavor.terminal, for example
	return readable<T[]>([], (set) => {
		let innerUnsub: Unsubscriber;

		const outerUnsub = store.subscribe((current) => {
			if (innerUnsub) innerUnsub();

			innerUnsub = derived(
				current.map((value: Readable<T[]>) => value),
				(inners) => inners.flat()
			).subscribe((currentFlat) => {
				set(currentFlat);
			});
		});

		return outerUnsub;
	});
}
