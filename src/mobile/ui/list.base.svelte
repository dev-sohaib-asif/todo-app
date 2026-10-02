<script lang="ts">
	import { List } from 'framework7-svelte';
	import type { Snippet } from 'svelte';

	let { inset = false, children }: { inset?: boolean; children?: Snippet } = $props();
</script>

<List {inset} strong>{@render children?.()}</List>
