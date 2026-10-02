<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import { ListChecks } from '@lucide/svelte';
	import { detectUiMode } from '$shared/application/device';

	let { children } = $props();
	let mode = $state<'pending' | 'desktop' | 'mobile'>('pending');
	let MobileApp = $state<Component | null>(null);

	onMount(async () => {
		if (detectUiMode() === 'mobile') {
			// Lazy: Framework7 JS/CSS is only downloaded on phones and tablets.
			MobileApp = (await import('$mobile/MobileApp.svelte')).default;
			mode = 'mobile';
		} else {
			mode = 'desktop';
		}
	});
</script>

{#if mode === 'mobile' && MobileApp}
	<MobileApp />
{:else if mode === 'desktop'}
	<header class="border-b">
		<div class="mx-auto flex max-w-3xl items-center gap-2 p-4">
			<ListChecks class="size-5" />
			<a href="/todos" class="font-semibold">Todo App</a>
		</div>
	</header>
	<main class="mx-auto max-w-3xl p-4">{@render children()}</main>
{/if}
