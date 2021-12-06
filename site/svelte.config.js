import autoPreprocess from "svelte-preprocess";

/**
 * This will add autocompletion if you're working with SvelteKit
 *
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
    preprocess: autoPreprocess(),
};

export default config;