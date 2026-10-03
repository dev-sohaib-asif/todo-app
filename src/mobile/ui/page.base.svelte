<script lang="ts">
	import { Page, Navbar } from 'framework7-svelte';
	import type { Snippet } from 'svelte';

	let {
		title,
		back,
		onrefresh,
		onshow,
		children
	}: {
		title: string;
		/** Show a back link. The URL is the fallback destination when there is no previous page
		 *  in F7's history (e.g. the app was opened directly on this page). */
		back?: string;
		onrefresh?: () => Promise<void> | void;
		/** Called every time the page is about to be shown, including when returning to it via back. */
		onshow?: () => void;
		children?: Snippet;
	} = $props();
</script>

<Page
	ptr={!!onrefresh}
	onPtrRefresh={async (done: () => void) => { await onrefresh?.(); done(); }}
	onPageBeforeIn={() => onshow?.()}
>
	<Navbar {title} backLink={back ? 'Back' : undefined} backLinkUrl={back} />
	{@render children?.()}
</Page>
