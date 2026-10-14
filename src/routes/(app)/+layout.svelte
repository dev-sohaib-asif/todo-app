<script lang="ts">
	import { onMount, type Component, type Snippet } from 'svelte';
	import { ListChecks } from '@lucide/svelte';
	import { detectUiMode } from '$shared/application/device';

	let { children } = $props();
	// ssr = false (src/routes/+layout.ts), so this only ever runs in the browser.
	const isMobile = detectUiMode() === 'mobile';
	let MobileApp = $state<Component<{ children?: Snippet }> | null>(null);

	onMount(() => {
		if (isMobile) {
			// Lazy: Framework7 JS/CSS is only downloaded on phones and tablets.
			import('$mobile/MobileApp.svelte').then((m) => (MobileApp = m.default));
		}
	});
</script>

{#if isMobile}
	{#if MobileApp}
		<MobileApp>{@render children()}</MobileApp>
	{/if}
{:else}
	<header class="border-b">
		<div class="mx-auto flex max-w-3xl items-center gap-2 p-4">
			<ListChecks class="size-5" />
			<a href="/todos" class="font-semibold">Todo App</a>
		</div>
	</header>
	<main class="mx-auto max-w-3xl p-4">{@render children()}</main>
{/if}
