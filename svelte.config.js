import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({ fallback: 'index.html' }),
		alias: {
			$modules: 'src/modules',
			$network: 'src/network',
			$shared: 'src/shared',
			$mobile: 'src/mobile'
		}
	}
};
