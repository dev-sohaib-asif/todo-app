<script lang="ts">
	import 'framework7/css/bundle';
	import { App, View } from 'framework7-svelte';
	import { f7params, initialUrl } from './f7';
</script>

<App {...f7params}>
	<View main url={initialUrl()} />
</App>
