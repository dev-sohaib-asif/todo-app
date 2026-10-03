<script lang="ts">
	import Page from '$mobile/ui/page.base.svelte';
	import TodoForm from '../components/TodoForm.mobile.svelte';
	import { todoApi } from '$modules/todos/data/api';
	import type { CreateTodoDto } from '$modules/todos/domain/types';
	import type { F7Router } from '$mobile/types';

	let { f7router }: { f7router: F7Router } = $props();
	let busy = $state(false);

	async function create(dto: CreateTodoDto) {
		busy = true;
		try {
			await todoApi.create(dto);
			f7router.back('/todos/');
		} finally {
			busy = false;
		}
	}
</script>

<Page title="New todo" back="/todos/">
	<TodoForm submitLabel="Create" {busy} onsubmit={create} />
</Page>
