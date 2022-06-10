import { Direction, type FullRecipe } from '$lib/common/types';
import { FlavorType } from '$lib/flavors';

export const defaultRecipe: FullRecipe = {
	id: 0,
	mainIngredientId: 0,
	mainIngredient: {
		id: 0,
		parentIngredientId: null,
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
		subIngredients: [
			{
				id: 1,
				parentIngredientId: 0,
				name: 'code',
				flavors: [
					{
						id: 4,
						ingredientId: 1,
						name: 'code',
						type: FlavorType.Text,
						directions: [Direction.Out],
						parameters: {
							text: ''
						},
						options: null
					}
				],
				subIngredients: [],
				connections: [],
				x: 200,
				y: 400
			},
			{
				id: 2,
				parentIngredientId: 0,
				name: 'shader',
				flavors: [
					{
						id: 5,
						ingredientId: 2,
						name: 'texture',
						type: FlavorType.Image,
						directions: [Direction.In, Direction.Out],
						parameters: {
							image: null,
							height: null,
							weight: null
						},
						options: null
					},
					{
						id: 6,
						ingredientId: 2,
						name: 'code',
						type: FlavorType.Text,
						directions: [Direction.In],
						parameters: {
							text: ''
						},
						options: null
					}
				],
				subIngredients: [],
				connections: [],
				x: 400,
				y: 400
			}
		],
		connections: [],
		x: 100,
		y: 200
	}
};
