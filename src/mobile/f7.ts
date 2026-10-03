import Framework7 from 'framework7/lite-bundle';
import Framework7Svelte from 'framework7-svelte';
import routes from './routes';

Framework7.use(Framework7Svelte);

export const f7params = {
	name: 'Todo App',
	theme: 'auto', // iOS look on iPhone/iPad, Material on Android
	darkMode: 'auto', // adds `dark` class on <html>, which shadcn also keys off
	routes,
	view: {
		browserHistory: false, // F7 keeps its own history; the address bar is untouched
		// Anti-"ghost page" settings. An interrupted or overlapping page transition (including an aborted
		// swipe-back drag) can leave a stale page/navbar element stuck on top of the current page.
		iosSwipeBack: false, // no edge-drag gesture, so no half-finished gesture states
		iosDynamicNavbar: false, // each page keeps its own navbar instead of a shared, animated navbar layer
		preloadPreviousPage: false // go back by re-creating the previous page instead of reusing a stale one
		// Last resort if ghost pages still appear: add `animate: false` here (no transitions at all).
	}
};

/** Always start on the list so every other page has a real previous page in F7's history. */
export const initialUrl = '/todos/';
