import Framework7 from 'framework7/lite-bundle';
import Framework7Svelte from 'framework7-svelte';
import routes from './routes';

Framework7.use(Framework7Svelte);

export const f7params = {
	name: 'Todo App',
	theme: 'auto', // iOS look on iPhone/iPad, Material on Android
	darkMode: 'auto', // adds `dark` class on <html>, which shadcn also keys off
	routes,
	view: { browserHistory: false } // F7 keeps its own history; the address bar is untouched
};

/** Deep link: open F7 on the page matching the current SvelteKit URL. */
export function initialUrl(): string {
	const p = location.pathname.replace(/\/?$/, '/');
	return p.startsWith('/todos/') ? p : '/todos/';
}
