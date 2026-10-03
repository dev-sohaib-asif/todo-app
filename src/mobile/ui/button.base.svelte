<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		fill = false,
		color,
		disabled = false,
		onclick,
		children
	}: { fill?: boolean; color?: 'red'; disabled?: boolean; onclick?: () => void; children?: Snippet } = $props();
</script>

<!-- Native <button> with Framework7's button CSS and a normal click handler (no F7 event wiring). -->
<button
	type="button"
	class="button button-large"
	class:button-fill={fill}
	class:color-red={color === 'red'}
	class:disabled
	{disabled}
	onclick={() => onclick?.()}
>
	{@render children?.()}
</button>
