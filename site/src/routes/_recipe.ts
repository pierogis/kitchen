import { Direction, type FullRecipe, FlavorType } from '$lib/common/types';

export const defaultRecipe: FullRecipe = {
	uuid: '0',
	mainCallForUuid: '0',
	callsFor: [
		{
			uuid: '0',
			recipeUuid: '0',
			ingredientUuid: '0',
			ingredient: {
				uuid: '0',
				parentIngredientUuid: undefined,
				name: 'sort',
				flavors: [
					{
						uuid: '0',
						ingredientUuid: '0',
						name: 'image',
						type: FlavorType.Image,
						directions: [Direction.In, Direction.Out],
						options: null
					},
					{
						uuid: '1',
						ingredientUuid: '0',
						name: 'angle',
						type: FlavorType.Number,
						directions: [Direction.In],
						options: {
							min: 0,
							max: 360
						}
					},
					{
						uuid: '2',
						ingredientUuid: '0',
						name: 'lower',
						type: FlavorType.Number,
						directions: [Direction.In],
						options: {
							min: 0,
							max: 255
						}
					},
					{
						uuid: '3',
						ingredientUuid: '0',
						name: 'upper',
						type: FlavorType.Number,
						directions: [Direction.In],
						options: {
							min: 0,
							max: 255
						}
					}
				],
				connections: []
			},
			location: {
				uuid: '0',
				callForUuid: '0',
				x: 100,
				y: 200
			}
		},
		{
			uuid: '1',
			recipeUuid: '0',
			ingredientUuid: '1',
			ingredient: {
				uuid: '1',
				parentIngredientUuid: '0',
				name: 'code',
				flavors: [
					{
						uuid: '4',
						ingredientUuid: '1',
						name: 'code',
						type: FlavorType.Text,
						directions: [Direction.Out],
						options: null
					}
				],
				connections: []
			},
			location: {
				uuid: '1',
				callForUuid: '1',
				x: 200,
				y: 200
			}
		},
		{
			uuid: '2',
			recipeUuid: '0',
			ingredientUuid: '2',
			ingredient: {
				uuid: '2',
				parentIngredientUuid: '0',
				name: 'shader',
				flavors: [
					{
						uuid: '5',
						ingredientUuid: '2',
						name: 'texture',
						type: FlavorType.Image,
						directions: [Direction.In, Direction.Out],
						options: null
					},
					{
						uuid: '6',
						ingredientUuid: '2',
						name: 'code',
						type: FlavorType.Text,
						directions: [Direction.In],
						options: null
					},
					{
						uuid: '7',
						ingredientUuid: '2',
						name: 'color',
						type: FlavorType.Color,
						directions: [Direction.In],
						options: { view: 'color', color: { alpha: true } }
					}
				],
				connections: []
			},
			location: {
				uuid: '2',
				callForUuid: '2',
				x: 400,
				y: 200
			}
		}
	],
	parameters: [
		{
			uuid: '0',
			recipeUuid: '0',
			flavorUuid: '0',
			callForUuid: '0',
			payload: {
				type: FlavorType.Image,
				params: ''
			}
		},
		{
			uuid: '1',
			recipeUuid: '0',
			flavorUuid: '1',
			callForUuid: '0',
			payload: {
				type: FlavorType.Number,
				params: 0
			}
		},
		{
			uuid: '2',
			recipeUuid: '0',
			flavorUuid: '2',
			callForUuid: '0',
			payload: {
				type: FlavorType.Number,
				params: 40
			}
		},
		{
			uuid: '3',
			recipeUuid: '0',
			flavorUuid: '3',
			callForUuid: '0',
			payload: {
				type: FlavorType.Number,
				params: 180
			}
		},
		{
			uuid: '4',
			recipeUuid: '0',
			flavorUuid: '4',
			callForUuid: '1',
			payload: {
				type: FlavorType.Text,
				params: ''
			}
		},
		{
			uuid: '5',
			recipeUuid: '0',
			flavorUuid: '5',
			callForUuid: '2',
			payload: {
				type: FlavorType.Image,
				params: ''
			}
		},
		{
			uuid: '6',
			recipeUuid: '0',
			flavorUuid: '6',
			callForUuid: '2',
			payload: {
				type: FlavorType.Text,
				params: ''
			}
		},
		{
			uuid: '7',
			recipeUuid: '0',
			flavorUuid: '7',
			callForUuid: '2',
			payload: {
				type: FlavorType.Color,
				params: '#0088ff'
			}
		}
	],
	shaders: []
};
