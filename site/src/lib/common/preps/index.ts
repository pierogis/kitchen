import type { Flavor } from '@types';

export interface Prep {
	flavors: Omit<Flavor, 'uuid' | 'ingredientUuid'>[];
	cook: () => {};
}
