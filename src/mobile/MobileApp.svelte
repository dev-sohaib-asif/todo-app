<script lang="ts">
	import 'framework7/css/bundle';
	import { onMount } from 'svelte';
	import { App, View } from 'framework7-svelte';
	import { f7params, initialUrl, BROWSER_BACK, EDGE_SWIPE_BACK } from './f7';
	import { useBrowserBack, blockSvelteKitLinkNavigation } from './browser-back.svelte';
	import { enableEdgeSwipeBack } from './edge-swipe-back';

	blockSvelteKitLinkNavigation(); // Framework7 owns navigation on mobile
	if (BROWSER_BACK) useBrowserBack();
	onMount(() => (EDGE_SWIPE_BACK ? enableEdgeSwipeBack() : undefined));
</script>

<App {...f7params}>
	<View main url={initialUrl} />
</App>
