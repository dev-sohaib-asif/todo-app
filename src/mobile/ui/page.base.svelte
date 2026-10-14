<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Page, Navbar, f7, f7ready } from 'framework7-svelte';
	import type { Snippet } from 'svelte';

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

	function goBack(e: MouseEvent) {
		e.preventDefault(); // href is only a fallback; the click itself must pop history
		// Deep link (first history entry): go to the list instead of leaving the app.
		if (history.length > 1) history.back();
		else void goto('/todos');
	}

	onMount(() => {
		if (!onrefresh) return;
		// Framework7 creates PTR instances in its router's pageInit hook, which never runs here
		// (SvelteKit owns routing). Create it manually once the F7 app is ready.
		f7ready((f7app) => {
			const el = document.querySelector<HTMLElement>(`[data-ptr-host="${hostId}"] .ptr-content`);
			if (!el?.isConnected) return; // page unmounted before the app was ready
			ptrEl = el;
			f7app.ptr.create(el);
		});
	});

	onDestroy(() => {
		if (ptrEl) f7.ptr.destroy(ptrEl); // same lifecycle as F7's pageBeforeRemove
	});
</script>

{#snippet backControl()}
	{#if back}
		<!-- Same DOM F7's Navbar backLink renders (a.link.back.icon-only > i.icon-back), but the
		     click is ours: history.back() pops the SvelteKit entry the browser back button pops too.
		     href is a real fallback only; goBack always preventDefaults. -->
		<a href="/todos" class="link back icon-only" aria-label="Back" onclick={goBack}>
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
