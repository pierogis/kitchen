import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/env';
import type { Recipe } from '$lib/common/types';

export const recipeStore: Writable<Recipe> = writable(
	browser ? (localStorage.getItem('recipe') ? JSON.parse(localStorage.getItem('recipe')) : {}) : {}
);

recipeStore.subscribe((recipe) => {
	if (browser) {
		localStorage.setItem('recipe', JSON.stringify(recipe));
	}
});
