import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		files: {
			assets: 'static'
		},
		alias: {
			$types: 'src/lib/common/types.ts',
			$state: 'src/lib/state',
			$recipe: 'src/lib/state/stores/recipe.ts',
			$view: 'src/lib/state/stores/view',
			$components: 'src/lib/components',
			$db: 'src/db'
		}
	}
};

export default config;
