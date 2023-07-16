import type { SvelteComponent } from 'svelte';

import { FlavorType } from '$types';

import Color from './Color.svelte';
import Geometry from './Geometry.svelte';
import Image from './Image.svelte';
import Material from './Material.svelte';
import Number from './Number.svelte';
import Object from './Object.svelte';
import Shader from './Shader.svelte';
import Text from './Text.svelte';
import Texture from './Texture.svelte';

export const flavorComponents: {
	[type in FlavorType]: typeof SvelteComponent;
} = {
	[FlavorType.Color]: Color,
	[FlavorType.Geometry]: Geometry,
	[FlavorType.Image]: Image,
	[FlavorType.Material]: Material,
	[FlavorType.Number]: Number,
	[FlavorType.Object]: Object,
	[FlavorType.Shader]: Shader,
	[FlavorType.Text]: Text,
	[FlavorType.Texture]: Texture
};

import Flavor from './Flavor.svelte';
export { Flavor };
