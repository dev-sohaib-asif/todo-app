<script lang="ts">
	import { Page, Navbar } from 'framework7-svelte';
	import type { Snippet } from 'svelte';

	let {
		title,
		back = false,
		onrefresh,
		children
	}: { title: string; back?: boolean; onrefresh?: () => Promise<void> | void; children?: Snippet } = $props();
</script>

<Page ptr={!!onrefresh} onPtrRefresh={async (done: () => void) => { await onrefresh?.(); done(); }}>
	<Navbar {title} backLink={back ? 'Back' : undefined} />
	{@render children?.()}
</Page>
