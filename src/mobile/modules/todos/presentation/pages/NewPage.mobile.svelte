<script lang="ts">
	import Page from '$mobile/ui/page.base.svelte';
	import TodoForm from '../components/TodoForm.mobile.svelte';
	import { todoApi } from '$modules/todos/data/api';
	import type { CreateTodoDto } from '$modules/todos/domain/types';
	import type { F7Router } from '$mobile/types';

	let { f7router }: { f7router: F7Router } = $props();
	let busy = $state(false);
	let error = $state<string | null>(null);

	async function create(dto: CreateTodoDto) {
		busy = true;
		error = null;
		try {
			await todoApi.create(dto);
			f7router.back();
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
