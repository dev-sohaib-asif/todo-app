<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus } from '@lucide/svelte';
	import Page from '$mobile/ui/page.base.svelte';
	import Fab from '$mobile/ui/fab.base.svelte';
	import TodosData from '../components/TodosData.mobile.svelte';
	import { TodosListController } from '$modules/todos/domain/todo-route-controllers.svelte';
	import type { F7Router } from '$mobile/types';

	let { f7router }: { f7router: F7Router } = $props();
	const c = new TodosListController(); // shared with desktop
	onMount(() => c.load());
</script>

<!-- onshow: refresh when returning here (e.g. after creating a todo) -->
<Page title="Todos" onrefresh={() => c.load()} onshow={() => !c.loading && c.load()}>
	<p class="px-4 pt-2 text-sm opacity-70">{c.remaining} remaining</p>
	{#if c.error}<p class="p-4 text-red-600">{c.error}</p>{/if}
	{#if c.loading && c.todos.length === 0}
		<p class="p-4">Loading…</p>
	{:else}
		<TodosData todos={c.visible} ontoggle={(t) => c.toggle(t)} onremove={(id) => c.remove(id)} />
	{/if}
	<Fab onclick={() => f7router.navigate('/todos/new/')}><Plus /></Fab>
</Page>
