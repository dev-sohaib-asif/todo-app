<script lang="ts">
	import { detectUiMode } from '$shared/application/device';
	import NewPage from '$modules/todos/presentation/pages/NewPage.skeleton.svelte';

	// Mobile: dynamic import keeps framework7-svelte out of the desktop bundle.
	const mobile = detectUiMode() === 'mobile';
</script>

{#if mobile}
	{#await import('$mobile/modules/todos/presentation/pages/NewPage.mobile.svelte') then m}
		<m.default />
	{/await}
{:else}
	<NewPage />
{/if}
