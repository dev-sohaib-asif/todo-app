<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Page, Navbar, f7, f7ready } from 'framework7-svelte';
	import type { Snippet } from 'svelte';
	// The shared back helper (ui/back.ts): pops browser history, with a deep-link
	// fallback. Every back action in the app goes through it — never goto() for back.
	import { goBack } from './back';
	// Restores F7's router swipe-back gesture: touch listener that calls the SAME
	// goBack() on a quick left-edge swipe (see edge-swipe-back.ts for the rules).
	import { enableEdgeSwipeBack } from '$mobile/edge-swipe-back';

	let {
		title,
		back = false,
		onrefresh,
		children
	}: {
		/** Keep this STATIC. Changing the Navbar title after mount can break its back link. */
		title: string;
		/** Show a back control; it pops browser history (SvelteKit owns routing, so it is a real back). */
		back?: boolean;
		onrefresh?: () => Promise<void> | void;
		children?: Snippet;
	} = $props();

	// Scopes the pull-to-refresh element lookup to THIS page instance (never a stale page
	// that is still in the DOM during a route swap).
	const hostId = crypto.randomUUID();
	let ptrEl: HTMLElement | null = null;

	onMount(() => {
		if (onrefresh) {
			// Framework7 creates PTR instances in its router's pageInit hook, which never runs here
			// (SvelteKit owns routing). Create it manually once the F7 app is ready.
			f7ready((f7app) => {
				const el = document.querySelector<HTMLElement>(`[data-ptr-host="${hostId}"] .ptr-content`);
				if (!el?.isConnected) return; // page unmounted before the app was ready
				ptrEl = el;
				f7app.ptr.create(el);
			});
		}
		// EDGE-SWIPE-BACK (F7's old swipe-back gesture, router-free version):
		// only pages WITH a back control enable it (Detail/Edit/New) — the list root
		// is the first history entry, there is nothing to swipe back TO.
		// Returning its cleanup makes Svelte remove the listeners on this page's
		// unmount, so at any moment only the current page's listeners exist.
		if (back) return enableEdgeSwipeBack();
	});

	onDestroy(() => {
		if (ptrEl) f7.ptr.destroy(ptrEl); // same lifecycle as F7's pageBeforeRemove
	});
</script>

{#snippet backControl()}
	{#if back}
		<!-- Same DOM F7's Navbar backLink renders (a.link.back.icon-only > i.icon-back), but the
		     click is ours: goBack() (ui/back.ts) pops history.back() — the SAME entry the browser
		     back button, the edge-swipe gesture and system back all pop, so back behaves
		     consistently everywhere. href is a real fallback only; the handler always preventDefaults. -->
		<a
			href="/todos"
			class="link back icon-only"
			aria-label="Back"
			onclick={(e) => {
				e.preventDefault();
				goBack();
			}}
		>
			<i class="icon icon-back"></i>
		</a>
	{/if}
{/snippet}

<Page
	data-ptr-host={hostId}
	ptr={!!onrefresh}
	onPtrRefresh={async (done: () => void) => {
		await onrefresh?.();
		done();
	}}
>
	<Navbar {title} navLeft={backControl} />
	{@render children?.()}
</Page>
