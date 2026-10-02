<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus } from '@lucide/svelte';
	import PageHeader from '$shared/presentation/ui/page-header.base.svelte';
	import Button from '$shared/presentation/ui/button.base.svelte';
	import EmptyState from '$shared/presentation/ui/empty-state.base.svelte';
	import TodosData from '../components/TodosData.component.svelte';
	import { TodosListController } from '../../domain/todo-route-controllers.svelte';
	import type { TodoFilter } from '../../domain/types';

	const c = new TodosListController();
	const filters: TodoFilter[] = ['all', 'active', 'completed'];
	onMount(() => c.load());
</script>

<PageHeader title="Todos" description="{c.remaining} remaining">
	{#snippet actions()}
		<Button href="/todos/new"><Plus class="size-4" /> New todo</Button>
	{/snippet}
</PageHeader>

<div class="mb-4 flex gap-2">
	{#each filters as f}
		<Button size="sm" variant={c.filter === f ? 'default' : 'outline'} onclick={() => (c.filter = f)}>{f}</Button>
	{/each}
</div>

{#if c.error}<p class="text-destructive mb-3 text-sm">{c.error}</p>{/if}
{#if c.loading}
	<p class="text-muted-foreground text-sm">Loading…</p>
{:else if c.visible.length === 0}
	<EmptyState title="No todos here" description="Create one to get started." />
{:else}
	<TodosData todos={c.visible} ontoggle={(t) => c.toggle(t)} onremove={(id) => c.remove(id)} />
{/if}
