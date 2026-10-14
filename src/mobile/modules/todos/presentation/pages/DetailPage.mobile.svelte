<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Page from '$mobile/ui/page.base.svelte';
	import List from '$mobile/ui/list.base.svelte';
	import ListItem from '$mobile/ui/list-item.base.svelte';
	import Button from '$mobile/ui/button.base.svelte';
	import { TodoItemController } from '$modules/todos/domain/todo-route-controllers.svelte';

	const c = new TodoItemController();
	// Remounts on every return here (e.g. back from edit), so onMount refetches.
	onMount(() => c.load(page.params.id!));
</script>

<Page title="Todo" back>
	{#if c.loading && !c.todo}
		<p class="p-4">Loading…</p>
	{:else if c.todo}
		<List>
			<ListItem title="Title" after={c.todo.title} />
			<ListItem title="Status" after={c.todo.completed ? 'Completed' : 'Active'} />
			<ListItem title="Priority" after={c.todo.priority} />
			<ListItem title="Due date" after={c.todo.dueDate ?? '—'} />
			<ListItem title="Description" subtitle={c.todo.description || '—'} />
		</List>
		<div class="p-4"><Button fill onclick={() => goto(`/todos/${c.todo!.id}/edit`)}>Edit</Button></div>
	{:else}
		<p class="p-4 text-red-600">{c.error ?? 'Not found'}</p>
	{/if}
</Page>
