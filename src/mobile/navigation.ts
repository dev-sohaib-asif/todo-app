import type { F7Router } from './types';

/**
 * Go back one page. If there is no previous page (the app was opened directly on this page),
 * go to `fallback` instead of doing nothing.
 */
export function goBack(router: F7Router, fallback: string) {
	if (router.history.length > 1) router.back();
	else router.navigate(fallback, { reloadAll: true });
}
