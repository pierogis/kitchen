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
					uuid: '6',
					ingredientUuid: '2',
					name: 'radius',
					type: FlavorType.Number,
					prepUuid: '1',
					directions: [Direction.In],
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
					flavorMap: { sphere: '5', radius: '6' }
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
			uuid: '7',
			recipeUuid: '0',
			flavorUuid: '7',
			usageUuid: '2',
			payload: {
				type: FlavorType.Number,
				value: 1
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
