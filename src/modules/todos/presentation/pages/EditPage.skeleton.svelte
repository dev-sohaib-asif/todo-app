<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import PageHeader from '$shared/presentation/ui/page-header.base.svelte';
	import TodoForm from '../components/TodoForm.component.svelte';
	import { TodoItemController } from '../../domain/todo-route-controllers.svelte';
	import { todoApi } from '../../data/api';
	import type { CreateTodoDto } from '../../domain/types';

	const c = new TodoItemController();
	let busy = $state(false);
	let error = $state<string | null>(null);
	onMount(() => c.load(page.params.id!));

	async function save(dto: CreateTodoDto) {
		busy = true;
		error = null;
		try {
			await todoApi.update(c.todo!.id, dto);
			await goto(`/todos/${c.todo!.id}`);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to save';
		} finally {
			busy = false;
		}
	}
</script>

<PageHeader title="Edit todo" />
{#if error}<p class="text-destructive mb-3 text-sm">{error}</p>{/if}
{#if c.loading}
	<p class="text-muted-foreground text-sm">Loading…</p>
{:else if c.todo}
	<TodoForm
		initial={{ title: c.todo.title, description: c.todo.description, priority: c.todo.priority, dueDate: c.todo.dueDate }}
		submitLabel="Save changes"
		{busy}
		onsubmit={save}
	/>
{:else}
	<p class="text-destructive text-sm">{c.error ?? 'Not found'}</p>
{/if}
