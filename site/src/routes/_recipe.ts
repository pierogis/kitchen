import { Direction, type FullRecipe, FlavorType, PrepType } from '@types';

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
					prepUuid: '0',
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
					uuid: '0',
					ingredientUuid: '0',
					parentUsageUuid: undefined
				}
			],
			preps: [
				{
					uuid: '0',
					name: 'image out',
					ingredientUuid: '0',
					type: PrepType.Image,
					flavorMap: {
						image: '0'
					}
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
					prepUuid: '1',
					directions: [Direction.In, Direction.Out],
					options: null
				},
				{
					uuid: '7',
					ingredientUuid: '2',
					name: 'replace color',
					type: FlavorType.Color,
					directions: [Direction.In],
					options: { view: 'color', color: { alpha: true } }
				},
				{
					uuid: '8',
					ingredientUuid: '2',
					name: 'target color',
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
					ingredientUuid: '2',
					parentUsageUuid: '0'
				}
			],
			preps: [
				{
					uuid: '1',
					ingredientUuid: '1',
					name: 'shader',
					type: PrepType.Shader,
					flavorMap: { texture: '5' }
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
				value: ''
			}
		},
		{
			uuid: '1',
			recipeUuid: '0',
			flavorUuid: '1',
			usageUuid: '0',
			payload: {
				type: FlavorType.Number,
				value: 0
			}
		},
		{
			uuid: '2',
			recipeUuid: '0',
			flavorUuid: '2',
			usageUuid: '0',
			payload: {
				type: FlavorType.Number,
				value: 40
			}
		},
		{
			uuid: '3',
			recipeUuid: '0',
			flavorUuid: '3',
			usageUuid: '0',
			payload: {
				type: FlavorType.Number,
				value: 180
			}
		},
		{
			uuid: '5',
			recipeUuid: '0',
			flavorUuid: '5',
			usageUuid: '2',
			payload: {
				type: FlavorType.Image,
				value: ''
			}
		},
		{
			uuid: '6',
			recipeUuid: '0',
			flavorUuid: '6',
			usageUuid: '2',
			payload: {
				type: FlavorType.Text,
				value: ''
			}
		},
		{
			uuid: '7',
			recipeUuid: '0',
			flavorUuid: '7',
			usageUuid: '2',
			payload: {
				type: FlavorType.Color,
				value: '#b008ff'
			}
		},
		{
			uuid: '8',
			recipeUuid: '0',
			flavorUuid: '8',
			usageUuid: '2',
			payload: {
				type: FlavorType.Color,
				value: '#0588af'
			}
		}
	],
	shaders: [
		{
			uuid: '0',
			prepUuid: '1',
			recipeUuid: '0',
			vertexSource: '',
			fragmentSource: ''
		}
	]
};
