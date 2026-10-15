import { goto } from '$app/navigation';

/**
 * THE single "go back" helper for the mobile app.
 *
 * Framework7's router used to own back navigation (router.back()); SvelteKit owns
 * routing now, so every back action in the app (navbar back button, left-edge swipe,
 * post-delete navigation) funnels through THIS function. One function = one history
 * pop = a gesture can never navigate back twice.
 *
 * - history.back()  -> pops the current SvelteKit history entry (same entry the
 *                      browser/system back button pops, so they always agree).
 * - goto('/todos')  -> only when there is nothing to pop (app deep-linked as the
 *                      very first history entry); otherwise back() would EXIT the app.
 */
export function goBack() {
	if (history.length > 1) history.back();
	else void goto('/todos');
}
