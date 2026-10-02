<script lang="ts">
	import { ListChecks } from '@lucide/svelte';
	let { children } = $props();
</script>

<header class="border-b">
	<div class="mx-auto flex max-w-3xl items-center gap-2 p-4">
		<ListChecks class="size-5" />
		<a href="/todos" class="font-semibold">Todo App</a>
	</div>
</header>
<main class="mx-auto max-w-3xl p-4">{@render children()}</main>
