import { FlavorType } from '@types';

export const flavorTypes: { [name: string]: FlavorType } = {
	color: FlavorType.Color,
	geometry: FlavorType.Geometry,
	image: FlavorType.Image,
	material: FlavorType.Material,
	number: FlavorType.Number,
	object: FlavorType.Object,
	shader: FlavorType.Shader,
	text: FlavorType.Text,
	texture: FlavorType.Texture
};
