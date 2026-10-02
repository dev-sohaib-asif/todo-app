<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHeader from '$shared/presentation/ui/page-header.base.svelte';
	import TodoForm from '../components/TodoForm.component.svelte';
	import { todoApi } from '../../data/api';
	import type { CreateTodoDto } from '../../domain/types';

	let busy = $state(false);
	let error = $state<string | null>(null);

	async function create(dto: CreateTodoDto) {
		busy = true;
		error = null;
		try {
			const todo = await todoApi.create(dto);
			await goto(`/todos/${todo.id}`);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to create';
		} finally {
			busy = false;
		}
	}
</script>

<PageHeader title="New todo" />
{#if error}<p class="text-destructive mb-3 text-sm">{error}</p>{/if}
<TodoForm submitLabel="Create" {busy} onsubmit={create} />
