<script lang="ts">
	import 'framework7/css/bundle';
	import './page-transitions.css';
	import { onNavigate } from '$app/navigation';
	import { App } from 'framework7-svelte';
	import { f7params } from './f7';
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();

	const depth = (path: string) => path.split('/').filter(Boolean).length;

	// Framework7 used to animate page push/pop; this reimplements that via the
	// View Transitions API (page-transitions.css holds the F7-equivalent CSS).
	// Registered only here, so desktop never gets it. Skipped when unsupported
	// or the user prefers reduced motion.
	onNavigate((navigation) => {
		if (navigation.willUnload || !navigation.from || !navigation.to) return;
		if (!document.startViewTransition) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		document.documentElement.dataset.vt =
			depth(navigation.to.url.pathname) >= depth(navigation.from.url.pathname)
				? 'forward'
				: 'backward';
		return new Promise<void>((resolve) => {
			const transition = document.startViewTransition(async () => {
				// Resume the navigation (onNavigate's promise gates it) while the
				// transition is live, then wait for the DOM update before the
				// browser captures the "new" snapshot.
				resolve();
				await navigation.complete.catch(() => {});
			});
			transition.finished.finally(() => {
				delete document.documentElement.dataset.vt;
			});
		});
	});
</script>

<!-- Framework7 is UI only here (navbar, lists, PTR). Routing is SvelteKit's: the page
     components come from src/routes/(app) and render inside this app shell. -->
<App {...f7params}>
	<div class="view view-main">
		{@render children?.()}
	</div>
</App>
