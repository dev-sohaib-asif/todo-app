<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Plus } from '@lucide/svelte';
	import { f7 } from 'framework7-svelte';
	import Page from '$mobile/ui/page.base.svelte';
	import Fab from '$mobile/ui/fab.base.svelte';
	import TodosData from '../components/TodosData.mobile.svelte';
	import { TodosListController } from '$modules/todos/domain/todo-route-controllers.svelte';
	import type { TodoFilter } from '$modules/todos/domain/types';

	const c = new TodosListController(); // shared with desktop
	const filters: { value: TodoFilter; label: string }[] = [
		{ value: 'all', label: 'All' },
		{ value: 'active', label: 'Active' },
		{ value: 'completed', label: 'Done' }
	];
	// SvelteKit remounts this page on every return to it (e.g. after creating a todo),
	// so onMount already refetches; PTR handles manual refresh.
	onMount(() => c.load());

	async function remove(id: string) {
		await c.remove(id);
		f7.toast.show({ text: 'Todo deleted', closeTimeout: 2000 });
	}
</script>

<Page title="Todos" onrefresh={() => c.load()}>
	<div class="segmented segment-colored mx-4 my-2">
		{#each filters as f}
			<button
				type="button"
				class="button"
				class:active={c.filter === f.value}
				aria-pressed={c.filter === f.value}
				onclick={() => (c.filter = f.value)}
			>
				{f.label}
			</button>
		{/each}
	</div>
	<p class="px-4 pt-1 text-sm opacity-70">{c.remaining} remaining</p>
	{#if c.error}<p class="p-4 text-red-600">{c.error}</p>{/if}
	{#if c.loading && c.todos.length === 0}
		<ul class="list skeleton-effect-wave">
			{#each Array(6) as _}
				<li>
					<div class="item-content">
						<div class="item-inner"><div class="skeleton-text">Todo title placeholder</div></div>
					</div>
				</li>
			{/each}
		</ul>
	{:else if c.visible.length === 0}
		<p class="p-4 opacity-70">Nothing here. Tap + to add a todo.</p>
	{:else}
		<TodosData todos={c.visible} ontoggle={(t) => c.toggle(t)} onremove={(id) => remove(id)} />
	{/if}
	<Fab onclick={() => goto('/todos/new')}><Plus /></Fab>
</Page>
