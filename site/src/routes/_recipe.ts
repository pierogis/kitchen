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
					name: 'geometry',
					type: FlavorType.Geometry,
					prepUuid: '0',
					directions: [Direction.In, Direction.Out],
					options: null
				},
				{
					uuid: '1',
					ingredientUuid: '0',
					name: 'radius',
					type: FlavorType.Number,
					directions: [Direction.In],
					options: {
						min: 0,
						max: 360
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
					name: 'scene',
					ingredientUuid: '0',
					type: PrepType.Scene,
					flavorMap: {
						geometry: '0'
					}
				}
			]
		},
		{
			uuid: '2',
			parentIngredientUuid: '0',
			name: 'sphere',
			flavors: [
				{
					uuid: '5',
					ingredientUuid: '2',
					name: 'sphere',
					type: FlavorType.Geometry,
					prepUuid: '1',
					directions: [Direction.Out],
					options: null
				},
				{
					uuid: '7',
					ingredientUuid: '2',
					name: 'radius',
					type: FlavorType.Number,
					directions: [Direction.In],
					options: null
				}
			],
			connections: [],
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
					name: 'sphere',
					type: PrepType.Sphere,
					flavorMap: { radius: '7' }
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
				type: FlavorType.Number,
				value: '1'
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
