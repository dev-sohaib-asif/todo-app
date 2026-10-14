import { goto } from '$app/navigation';

/** Pop browser history; deep-link fallback (nothing to pop) goes to the list. */
export function goBack() {
	if (history.length > 1) history.back();
	else void goto('/todos');
}
