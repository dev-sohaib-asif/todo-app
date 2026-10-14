<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Plus } from '@lucide/svelte';
	import Page from '$mobile/ui/page.base.svelte';
	import Fab from '$mobile/ui/fab.base.svelte';
	import TodosData from '../components/TodosData.mobile.svelte';
	import { TodosListController } from '$modules/todos/domain/todo-route-controllers.svelte';

	const c = new TodosListController(); // shared with desktop
	// SvelteKit remounts this page on every return to it (e.g. after creating a todo),
	// so onMount already refetches; PTR handles manual refresh.
	onMount(() => c.load());
</script>

<Page title="Todos" onrefresh={() => c.load()}>
	<p class="px-4 pt-2 text-sm opacity-70">{c.remaining} remaining</p>
	{#if c.error}<p class="p-4 text-red-600">{c.error}</p>{/if}
	{#if c.loading && c.todos.length === 0}
		<p class="p-4">Loading…</p>
	{:else}
		<TodosData todos={c.visible} ontoggle={(t) => c.toggle(t)} onremove={(id) => c.remove(id)} />
	{/if}
	<Fab onclick={() => goto('/todos/new')}><Plus /></Fab>
</Page>
