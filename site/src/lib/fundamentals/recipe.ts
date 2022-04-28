import { type Writable, writable } from 'svelte/store';
import { Pane } from 'tweakpane';
import { ParameterType } from '../connections/connections';
import { attachColor } from './color';
import { attachText } from './text';
import { attachNumber } from './number';
import { attachImage } from './image';
import { attachAudio } from './audio';

enum FundamentalType {
	number = 'number',
	color = 'color',
	text = 'text',
	image = 'image',
	audio = 'audio'
}

interface Ingredient {
	name: string;
	fundamentals: {
		[name: string]: {
			type: FundamentalType;
			initial: any;
		};
	};
}

interface Recipe {
	ingredients: Ingredient[];
}

const fundamentals: {
	[type in FundamentalType]: (pane: Pane, store: Writable<any>) => any;
} = {
	number: attachNumber,
	color: attachColor,
	text: attachText,
	image: attachImage,
	audio: attachAudio
};

async function asdf(recipeId: number) {
	const recipeResponse = await fetch(`/api/recipes/${recipeId}`);
	const recipe: Recipe = await recipeResponse.json();

	recipe.ingredients.forEach((ingredient) => {
		const pane = new Pane();
		Object.entries(ingredient.fundamentals).forEach(([name, fundamental]) => {
			const store = writable(fundamental.initial);
			const attach = fundamentals[fundamental.type];
			attach(pane, store);
		});
	});
}
