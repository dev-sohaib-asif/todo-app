<script lang="ts">
	import { Fab } from 'framework7-svelte';
	import type { Snippet } from 'svelte';

	let { onclick, children }: { onclick: () => void; children?: Snippet } = $props();
</script>

<Fab position="right-bottom" onClick={onclick}>{@render children?.()}</Fab>
