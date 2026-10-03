import { f7 } from 'framework7-svelte';
import type { F7Router } from './types';

/**
 * One shared "go back" for everything that can trigger it: the edge swipe (edge-swipe-back.ts) and the
 * browser/system back button (browser-back.svelte.ts). A single swipe can fire BOTH (the browser's own
 * edge-swipe / trackpad gesture goes back in browser history while our handler also fires), so the second
 * one must not go back again.
 */
const WINDOW_MS = 600;
let lastBackAt = 0;

export function getRouter(): F7Router | undefined {
	return f7.views?.main?.router as unknown as F7Router | undefined;
}

/** True if a back was already performed a moment ago (the same gesture is being reported twice). */
export function recentlyWentBack(): boolean {
	return Date.now() - lastBackAt < WINDOW_MS;
}

/**
 * Go back one page unless a back just happened.
 * @returns true if a back was performed now or just before; false if there is no previous page.
 */
export function goBackOnce(): boolean {
	if (recentlyWentBack()) return true;
	const router = getRouter();
	if (!router || router.history.length <= 1) return false;
	lastBackAt = Date.now();
	router.back();
	return true;
}
