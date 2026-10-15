<script lang="ts">
	import 'framework7/css/bundle';
	// Page push/pop animations (iOS slide / Material fade-slide), restoring what
	// Framework7's router used to animate. CSS half of the feature; the onNavigate
	// hook below is the JS half. Desktop never loads MobileApp, so desktop never gets it.
	import './page-transitions.css';
	import { onNavigate } from '$app/navigation';
	import { App } from 'framework7-svelte';
	import { f7params } from './f7';
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();

	// URL "depth" = number of path segments (/todos=1, /todos/5=2, /todos/5/edit=3).
	// Depth going UP = navigating deeper = "forward" (push); down = "backward" (pop).
	const depth = (path: string) => path.split('/').filter(Boolean).length;

	// FRAMEWORK7-STYLE PAGE TRANSITIONS (see page-transitions.css for the CSS half).
	// Runs before EVERY SvelteKit navigation while this mobile shell is mounted:
	//   1. bail out if: leaving the app / first load / no startViewTransition support /
	//      user asked for reduced motion -> navigation runs instantly (no animation).
	//   2. tag <html data-vt="forward|backward"> so the CSS knows which keyframes
	//      to play (html.ios / html.md themes are set by Framework7 at app init).
	//   3. document.startViewTransition() = browser snapshots the old page, lets
	//      SvelteKit swap the DOM, snapshots the new page, animates between them.
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
				// Returning this promise from onNavigate GATES SvelteKit's navigation,
				// so resolve() first to let it proceed while the transition is live,
				// then wait for its DOM update — only then does the browser capture
				// the "new" snapshot (capturing earlier would freeze the old page).
				resolve();
				await navigation.complete.catch(() => {}); // cancelled nav: still end the transition
			});
			transition.finished.finally(() => {
				delete document.documentElement.dataset.vt; // tidy up; next nav sets it fresh
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
