<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Page from '$mobile/ui/page.base.svelte';
	import TodoForm from '../components/TodoForm.mobile.svelte';
	import { TodoItemController } from '$modules/todos/domain/todo-route-controllers.svelte';
	import { todoApi } from '$modules/todos/data/api';
	import type { CreateTodoDto } from '$modules/todos/domain/types';

	const c = new TodoItemController();
	let busy = $state(false);
	let error = $state<string | null>(null);
	onMount(() => c.load(page.params.id!));

	async function save(dto: CreateTodoDto) {
		busy = true;
		error = null;
		try {
			await todoApi.update(c.todo!.id, dto);
			// Pop this form's history entry instead of pushing another detail entry.
			// A push left the form in the stack, so Back from the detail returned to the
			// stale form first. The detail remounts on the pop and refetches saved data.
			if (history.length > 1) history.back();
			else void goto(`/todos/${c.todo!.id}`, { replaceState: true }); // deep link: nothing to pop
		} catch (e) {
			console.error('Save todo failed', e);
			error = e instanceof Error ? e.message : 'Failed to save';
		} finally {
			busy = false;
		}
	}
</script>

<Page title="Edit todo" back>
	{#if error}<p class="p-4 text-red-600">{error}</p>{/if}
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
