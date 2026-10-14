<script lang="ts">
	import { detectUiMode } from '$shared/application/device';
	import DetailPage from '$modules/todos/presentation/pages/DetailPage.skeleton.svelte';

	// Mobile: dynamic import keeps framework7-svelte out of the desktop bundle.
	const mobile = detectUiMode() === 'mobile';
</script>

{#if mobile}
	{#await import('$mobile/modules/todos/presentation/pages/DetailPage.mobile.svelte') then m}
		<m.default />
	{/await}
{:else}
	<DetailPage />
{/if}
