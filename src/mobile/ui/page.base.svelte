<script lang="ts">
	import { Page, Navbar } from 'framework7-svelte';
	import type { Snippet } from 'svelte';

	let {
		title,
		back = false,
		onrefresh,
		onshow,
		children
	}: {
		/** Keep this STATIC. Changing the Navbar title after mount can break its back link. */
		title: string;
		/** Show F7's standard back link. Do not add backLinkUrl/backLinkForce: they push a NEW page instead of going back. */
		back?: boolean;
		onrefresh?: () => Promise<void> | void;
		/** Called every time the page has finished transitioning in, including when returning to it via back. */
		onshow?: () => void;
		children?: Snippet;
	} = $props();
</script>

<Page
	ptr={!!onrefresh}
	onPtrRefresh={async (done: () => void) => { await onrefresh?.(); done(); }}
	onPageAfterIn={() => onshow?.()}
>
	<Navbar {title} backLink={back ? 'Back' : undefined} />
	{@render children?.()}
</Page>
