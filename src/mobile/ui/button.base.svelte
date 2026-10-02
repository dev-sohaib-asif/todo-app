<script lang="ts">
	import { Button } from 'framework7-svelte';
	import type { Snippet } from 'svelte';

	let {
		fill = false,
		color,
		disabled = false,
		onclick,
		children
	}: { fill?: boolean; color?: 'red'; disabled?: boolean; onclick?: () => void; children?: Snippet } = $props();
</script>

<Button {fill} {color} {disabled} large onClick={() => onclick?.()}>{@render children?.()}</Button>
