<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { f7 } from 'framework7-svelte';
	import Page from '$mobile/ui/page.base.svelte';
	import List from '$mobile/ui/list.base.svelte';
	import ListItem from '$mobile/ui/list-item.base.svelte';
	import Button from '$mobile/ui/button.base.svelte';
	// Shared back helper (router_clone/application/back.ts): pops browser history to
	// return to the list — same function the navbar back button and edge-swipe gesture
	// use, so after a delete we land on the list with ONE history pop (no duplicates).
	import { goBack } from '$mobile/router_clone/application/back';
	import { TodoItemController } from '$modules/todos/domain/todo-route-controllers.svelte';
	import { todoApi } from '$modules/todos/data/api';

	const c = new TodoItemController();
	// Remounts on every return here (e.g. back from edit), so onMount refetches.
	onMount(() => c.load(page.params.id!));

	function remove() {
		f7.dialog.confirm('Delete this todo?', 'Delete', async () => {
			await todoApi.remove(c.todo!.id);
			f7.toast.show({ text: 'Todo deleted', closeTimeout: 2000 });
			goBack(); // not goto(): pop THIS detail page's history entry (falls back to /todos on a deep link)
		});
	}
</script>

<Page title="Todo" back>
	{#if c.loading && !c.todo}
		<ul class="list skeleton-effect-wave">
			{#each Array(4) as _}
				<li>
					<div class="item-content">
						<div class="item-inner"><div class="skeleton-text">Todo detail placeholder</div></div>
					</div>
				</li>
			{/each}
		</ul>
	{:else if c.todo}
		<List>
			<ListItem title="Title" after={c.todo.title} />
			<ListItem title="Status" after={c.todo.completed ? 'Completed' : 'Active'} />
			<ListItem title="Priority" after={c.todo.priority} />
			<ListItem title="Due date" after={c.todo.dueDate ?? '—'} />
			<ListItem title="Description" subtitle={c.todo.description || '—'} />
		</List>
		<div class="grid gap-2 p-4">
			<Button fill onclick={() => goto(`/todos/${c.todo!.id}/edit`)}>Edit</Button>
			<Button fill color="red" onclick={remove}>Delete</Button>
		</div>
	{:else}
		<p class="p-4 text-red-600">{c.error ?? 'Not found'}</p>
	{/if}
</Page>
