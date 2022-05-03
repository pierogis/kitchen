import { Direction, type Recipe } from '$lib/common/types';
import { FlavorType } from '.';

const defaultRecipe: Recipe = {
	ingredients: {
		sort: {
			name: 'sort',
			flavors: [
				{
					name: 'image',
					type: FlavorType.image,
					directions: [Direction.in, Direction.out],
					initial: new HTMLImageElement()
				},
				{
					name: 'angle',
					type: FlavorType.number,
					directions: [Direction.in],
					initial: 0,
					options: {
						min: 0,
						max: 360
					}
				},
				{
					name: 'lower',
					type: FlavorType.number,
					directions: [Direction.in],
					initial: 40,
					options: {
						min: 0,
						max: 255
					}
				},
				{
					name: 'upper',
					type: FlavorType.number,
					directions: [Direction.in],
					initial: 180,
					options: {
						min: 0,
						max: 255
					}
				}
			]
		}
	}
};
