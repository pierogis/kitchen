import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter(),
		alias: {
			'@types': 'src/lib/common/types.d.ts',
			'@state': 'src/lib/state',
			'@recipe': 'src/lib/state/stores/recipe.ts',
			'@view': 'src/lib/state/stores/view',
			'@components': 'src/lib/components'
		}
	}
};

export default config;
