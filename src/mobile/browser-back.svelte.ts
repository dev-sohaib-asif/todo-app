import { onMount } from 'svelte';
import { page } from '$app/state';
import { beforeNavigate, pushState } from '$app/navigation';
import { goBackOnce } from './navigation';

/**
 * Stops SvelteKit's router from also handling clicks on links inside the Framework7 app.
 *
 * SvelteKit intercepts every same-origin `<a href>` click (e.g. a ListItem `link="/todos/5/"`) and runs its
 * own navigation: it changes the URL, adds a browser history entry and resets `page.state`. Framework7 handles
 * the same click itself, so both routers navigated at once. Framework7 owns navigation on mobile, so the
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
 *   - a back just happened (e.g. our own edge swipe handled the same gesture) -> only put the guard back.
 *   - F7 has a previous page -> go back inside F7 and put the guard back.
 *   - F7 is on its first page -> leave for real (`history.back()`).
 * In-app Back links and the edge swipe never touch browser history, so the guard stays in place.
 * The guard is re-added with retries, because pushing it while SvelteKit is still handling the pop can fail,
 * and a missing guard makes the next back press leave the app.
 *
 * Call once from a component (needs component context for $effect/onMount).
 */
export function useBrowserBack() {
	let guarded = false; // true once we have seen our guard entry on top
	let timer: ReturnType<typeof setTimeout> | undefined;

	/** Make sure the guard entry is on top; retry until it is visible in page.state. */
	function armGuard(attempt = 0) {
		clearTimeout(timer);
		if (page.state.f7guard) return;
		if (attempt > 10) return;
		try {
			pushState('', { f7guard: true });
		} catch {
			// SvelteKit's router may not be ready yet (pushState throws if called too early).
		}
		timer = setTimeout(() => armGuard(attempt + 1), 120);
	}

	onMount(() => {
		armGuard();
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
		if (goBackOnce()) {
			// Went back inside F7 (or our edge swipe already did): keep one guard entry on top.
			setTimeout(() => armGuard(), 60);
		} else {
			history.back(); // already on F7's first page: let the browser leave
		}
	});
}
