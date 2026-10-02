<script lang="ts">
	import * as Card from '$shared/presentation/ui/shadcn-ui/card/index.js';
	import type { Snippet } from 'svelte';

	let { title, children }: { title?: string; children?: Snippet } = $props();
</script>

<Card.Root>
	{#if title}<Card.Header><Card.Title>{title}</Card.Title></Card.Header>{/if}
	<Card.Content>{@render children?.()}</Card.Content>
</Card.Root>
