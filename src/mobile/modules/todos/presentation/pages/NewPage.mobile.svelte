<script lang="ts">
	import { goto } from '$app/navigation';
	import Page from '$mobile/ui/page.base.svelte';
	import TodoForm from '../components/TodoForm.mobile.svelte';
	import { todoApi } from '$modules/todos/data/api';
	import type { CreateTodoDto } from '$modules/todos/domain/types';

	let busy = $state(false);
	let error = $state<string | null>(null);

	async function create(dto: CreateTodoDto) {
		busy = true;
		error = null;
		try {
			const todo = await todoApi.create(dto);
			// replaceState swaps this form's history entry for the detail entry (same stack
			// shape as before: list -> detail). A push would have kept the form behind the
			// detail, so Back from the detail landed on the stale form again.
			await goto(`/todos/${todo.id}`, { replaceState: true });
		} catch (e) {
			console.error('Create todo failed', e);
			error = e instanceof Error ? e.message : 'Failed to create';
		} finally {
			busy = false;
		}
	}
</script>

<Page title="New todo" back>
	{#if error}<p class="p-4 text-red-600">{error}</p>{/if}
	<TodoForm submitLabel="Create" {busy} onsubmit={create} />
</Page>
