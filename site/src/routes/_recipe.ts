import { Direction, type FullRecipe } from '$lib/common/types';
import { FlavorType } from '$lib/flavors';

const defaultRecipe: FullRecipe = {
	id: 0,
	mainIngredientId: 0,
	mainIngredient: {
		id: 0,
		parentIngredientId: null,
		name: 'sort',
		flavors: [],
		subIngredients: [
			{
				id: 1,
				parentIngredientId: 0,
				name: 'sort',
				flavors: [
					{
						id: 0,
						ingredientId: 1,
						name: 'image',
						type: FlavorType.Image,
						directions: [Direction.In, Direction.Out],
						parameters: {
							image: null,
							height: null,
							width: null
						},
						options: null
					},
					{
						id: 1,
						ingredientId: 1,
						name: 'angle',
						type: FlavorType.Number,
						directions: [Direction.In],
						parameters: {
							number: 0
						},
						options: {
							min: 0,
							max: 360
						}
					},
					{
						id: 2,
						ingredientId: 1,
						name: 'lower',
						type: FlavorType.Number,
						directions: [Direction.In],
						parameters: {
							number: 40
						},
						options: {
							min: 0,
							max: 255
						}
					},
					{
						id: 3,
						ingredientId: 1,
						name: 'upper',
						type: FlavorType.Number,
						directions: [Direction.In],
						parameters: {
							number: 180
						},
						options: {
							min: 0,
							max: 255
						}
					}
				],
				x: 0,
				y: 0,
				subIngredients: [],
				connections: []
			}
		],
		connections: [],
		x: 0,
		y: 0
	}
};
