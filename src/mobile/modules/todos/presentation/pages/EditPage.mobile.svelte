<script lang="ts">
	import { onMount } from 'svelte';
	import Page from '$mobile/ui/page.base.svelte';
	import TodoForm from '../components/TodoForm.mobile.svelte';
	import { TodoItemController } from '$modules/todos/domain/todo-route-controllers.svelte';
	import { todoApi } from '$modules/todos/data/api';
	import type { CreateTodoDto } from '$modules/todos/domain/types';
	import type { F7Route, F7Router } from '$mobile/types';

	let { f7route, f7router }: { f7route: F7Route; f7router: F7Router } = $props();
	const c = new TodoItemController();
	let busy = $state(false);
	onMount(() => c.load(f7route.params.id));

	async function save(dto: CreateTodoDto) {
		busy = true;
		try {
			await todoApi.update(c.todo!.id, dto);
			f7router.back(`/todos/${c.todo!.id}/`);
		} finally {
			busy = false;
		}
	}
</script>

<Page title="Edit todo" back={`/todos/${f7route.params.id}/`}>
	{#if c.todo}
		<TodoForm
			initial={{ title: c.todo.title, description: c.todo.description, priority: c.todo.priority, dueDate: c.todo.dueDate }}
			submitLabel="Save changes"
			{busy}
			onsubmit={save}
		/>
	{:else if c.loading}
		<p class="p-4">Loading…</p>
	{/if}
</Page>
