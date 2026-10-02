<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, description, children }: { title: string; description?: string; children?: Snippet } = $props();
</script>

<div class="text-muted-foreground flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
	<p class="text-foreground font-medium">{title}</p>
	{#if description}<p class="text-sm">{description}</p>{/if}
	{@render children?.()}
</div>
