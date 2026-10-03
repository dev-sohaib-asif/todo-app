<script lang="ts">
	import { onMount } from 'svelte';
	import Page from '$mobile/ui/page.base.svelte';
	import List from '$mobile/ui/list.base.svelte';
	import ListItem from '$mobile/ui/list-item.base.svelte';
	import Button from '$mobile/ui/button.base.svelte';
	import { TodoItemController } from '$modules/todos/domain/todo-route-controllers.svelte';
	import type { F7Route, F7Router } from '$mobile/types';

	let { f7route, f7router }: { f7route: F7Route; f7router: F7Router } = $props();
	const c = new TodoItemController();
	onMount(() => c.load(f7route.params.id));
</script>

<!-- onshow: re-fetch when returning from the edit page so changes appear -->
<Page title="Todo" back onshow={() => !c.loading && c.load(f7route.params.id)}>
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
		<div class="p-4"><Button fill onclick={() => f7router.navigate(`/todos/${c.todo!.id}/edit/`)}>Edit</Button></div>
	{:else}
		<p class="p-4 text-red-600">{c.error ?? 'Not found'}</p>
	{/if}
</Page>
