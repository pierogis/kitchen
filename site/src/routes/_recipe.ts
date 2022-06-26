import { Direction, type FullRecipe, FlavorType } from '@types';

export const defaultRecipe: FullRecipe = {
	uuid: '0',
	mainCallForUuid: '0',
	ingredients: [
		{
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
			connections: [],
			usages: [
				{
					id: 0,
					uuid: '0',
					ingredientUuid: '0'
				}
			]
		},
		{
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
			connections: [],
			usages: [
				{
					id: 1,
					uuid: '1',
					ingredientUuid: '1'
				}
			]
		},
		{
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
			connections: [
				{
					uuid: '0',
					parentIngredientUuid: '2',
					flavorType: FlavorType.Image,
					inFlavorUuid: '5',
					outFlavorUuid: '5',
					inUsageUuid: '2',
					outUsageUuid: '2'
				}
			],
			usages: [
				{
					uuid: '2',
					ingredientUuid: '2'
				}
			]
		}
	],
	callsFor: [
		{
			uuid: '0',
			recipeUuid: '0',
			usageUuid: '0',
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
			usageUuid: '1',
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
			usageUuid: '2',

			location: {
				uuid: '2',
				callForUuid: '2',
				x: 500,
				y: 200
			}
		}
	],
	parameters: [
		{
			uuid: '0',
			recipeUuid: '0',
			flavorUuid: '0',
			usageUuid: '0',
			payload: {
				type: FlavorType.Image,
				params: ''
			}
		},
		{
			uuid: '1',
			recipeUuid: '0',
			flavorUuid: '1',
			usageUuid: '0',
			payload: {
				type: FlavorType.Number,
				params: 0
			}
		},
		{
			uuid: '2',
			recipeUuid: '0',
			flavorUuid: '2',
			usageUuid: '0',
			payload: {
				type: FlavorType.Number,
				params: 40
			}
		},
		{
			uuid: '3',
			recipeUuid: '0',
			flavorUuid: '3',
			usageUuid: '0',
			payload: {
				type: FlavorType.Number,
				params: 180
			}
		},
		{
			uuid: '4',
			recipeUuid: '0',
			flavorUuid: '4',
			usageUuid: '1',
			payload: {
				type: FlavorType.Text,
				params: ''
			}
		},
		{
			uuid: '5',
			recipeUuid: '0',
			flavorUuid: '5',
			usageUuid: '2',
			payload: {
				type: FlavorType.Image,
				params: ''
			}
		},
		{
			uuid: '6',
			recipeUuid: '0',
			flavorUuid: '6',
			usageUuid: '2',
			payload: {
				type: FlavorType.Text,
				params: ''
			}
		},
		{
			uuid: '7',
			recipeUuid: '0',
			flavorUuid: '7',
			usageUuid: '2',
			payload: {
				type: FlavorType.Color,
				params: '#0088ff'
			}
		}
	],
	shaders: []
};
