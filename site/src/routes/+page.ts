import { defaultRecipe } from './_recipe';

/** @type {import('./index').PageLoad} */
export async function load() {
	return {
		recipe: defaultRecipe
	};
}
