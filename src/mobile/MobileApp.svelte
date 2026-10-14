<script lang="ts">
	import 'framework7/css/bundle';
	import { App } from 'framework7-svelte';
	import { f7params } from './f7';
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<!-- Framework7 is UI only here (navbar, lists, PTR). Routing is SvelteKit's: the page
     components come from src/routes/(app) and render inside this app shell. -->
<App {...f7params}>
	<div class="view view-main">
		{@render children?.()}
	</div>
</App>
