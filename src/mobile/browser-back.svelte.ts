import { onMount } from 'svelte';
import { page } from '$app/state';
import { beforeNavigate, pushState } from '$app/navigation';
import { f7 } from 'framework7-svelte';
import type { F7Router } from './types';

/**
 * Stops SvelteKit's router from also handling clicks on links inside the Framework7 app.
 *
 * SvelteKit intercepts every same-origin `<a href>` click (e.g. a ListItem `link="/todos/5/"`) and runs its
 * own navigation: it changes the URL, adds a browser history entry and resets `page.state`. Framework7 handles
 * the same click itself, so both routers navigated at once. That left history out of sync and (with the
 * back-button guard below) made Back from Detail jump or fail. Framework7 owns navigation on mobile, so the
 * SvelteKit navigation is cancelled. Back/forward (`popstate`) is left alone. Call once from a component.
 */
export function blockSvelteKitLinkNavigation() {
	beforeNavigate((nav) => {
		if (nav.type === 'link' || nav.type === 'goto') nav.cancel();
	});
}

/**
 * Connects the browser / Android system back button to Framework7's own history.
 *
 * Framework7 keeps its history internally (`browserHistory: false`), so the browser would otherwise leave
 * the app instead of going back one screen. We keep ONE extra "guard" history entry on top of the page
 * (created with SvelteKit's shallow routing, `pushState`). When the browser pops it:
 *   - F7 has a previous page  -> go back inside F7 and put the guard back.
 *   - F7 is on its first page -> leave for real (`history.back()`).
 * In-app Back links and swipe-back never touch browser history, so the guard stays in place.
 *
 * Call once from a component (needs component context for $effect/onMount).
 */
export function useBrowserBack() {
	let guarded = false; // true once we have seen our guard entry on top
	let timer: ReturnType<typeof setTimeout> | undefined;

	function pushGuard() {
		try {
			pushState('', { f7guard: true });
		} catch {
			// SvelteKit's router may not be ready yet (pushState throws if called too early): retry shortly.
			timer = setTimeout(pushGuard, 100);
		}
	}

	onMount(() => {
		pushGuard();
		return () => clearTimeout(timer);
	});

	$effect(() => {
		const present = !!page.state.f7guard;

		if (present) {
			guarded = true;
			return;
		}
		if (!guarded) return; // guard not installed yet

		// The guard entry was popped by the browser/system back button.
		guarded = false;
		const router = f7.views?.main?.router as unknown as F7Router | undefined;
		if (router && router.history.length > 1) {
			router.back();
			setTimeout(pushGuard, 0); // re-arm for the next back press
		} else {
			history.back(); // already on F7's first page: let the browser leave
		}
	});
}
