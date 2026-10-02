<script lang="ts">
	import { Button } from '$shared/presentation/ui/shadcn-ui/button/index.js';
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		size = 'default',
		href,
		type = 'button',
		disabled = false,
		class: className = '',
		onclick,
		children
	}: {
		variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		href?: string;
		type?: 'button' | 'submit';
		disabled?: boolean;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
	} = $props();
</script>

<Button {variant} {size} {href} {type} {disabled} {onclick} class={className}>
	{@render children?.()}
</Button>
