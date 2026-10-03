import Framework7 from 'framework7/lite-bundle';
import Framework7Svelte from 'framework7-svelte';
import routes from './routes';

Framework7.use(Framework7Svelte);

/**
 * Framework7's own interactive swipe-back needs `preloadPreviousPage` (the previous page is kept in the DOM).
 * With it on, the FIRST Back press from Detail to the list stopped working in this app, and stale "ghost"
 * pages appeared. So it stays OFF, and a simple edge-swipe handler (edge-swipe-back.ts) provides the gesture.
 * Turn this on only if you accept that risk.
 */
const F7_NATIVE_SWIPE_BACK = false;

/** Swipe from the left screen edge to go back one page (see edge-swipe-back.ts). Not interactive: no page-follows-finger drag. */
export const EDGE_SWIPE_BACK = true;

/** Make the browser/system back button go back inside Framework7 (see browser-back.svelte.ts). */
export const BROWSER_BACK = true;

export const f7params = {
	name: 'Todo App',
	theme: 'auto', // iOS look on iPhone/iPad, Material on Android
	darkMode: 'auto', // adds `dark` class on <html>, which shadcn also keys off
	routes,
	view: {
		browserHistory: false, // F7 keeps its own history; the address bar is untouched
		iosSwipeBack: F7_NATIVE_SWIPE_BACK,
		mdSwipeBack: F7_NATIVE_SWIPE_BACK,
		preloadPreviousPage: F7_NATIVE_SWIPE_BACK // going back re-creates the previous page (no stale pages)
		// If ghost pages still appear, add `animate: false` here (no transitions at all).
	}
};

/** Always start on the list so every other page has a real previous page in F7's history. */
export const initialUrl = '/todos/';
