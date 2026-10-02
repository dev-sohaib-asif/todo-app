<script lang="ts">
	import { Badge } from '$shared/presentation/ui/shadcn-ui/badge/index.js';
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		children
	}: { variant?: 'default' | 'secondary' | 'destructive' | 'outline'; children?: Snippet } = $props();
</script>

<Badge {variant}>{@render children?.()}</Badge>
