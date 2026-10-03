<script lang="ts">
	import type { Snippet } from 'svelte';

	let { onclick, label = 'Add', children }: { onclick: () => void; label?: string; children?: Snippet } = $props();

	function handle(e: MouseEvent) {
		e.preventDefault();
		onclick();
	}
</script>

<!--
	Built from Framework7's own FAB CSS classes with a native click handler. The <Fab> component's
	click event did not fire here, and its "fixed" slot did not render. `position: fixed` keeps the
	button on screen instead of scrolling with the list.
-->
<div class="fab fab-right-bottom" style="position: fixed;">
	<a href="#top" aria-label={label} onclick={handle}>{@render children?.()}</a>
</div>
