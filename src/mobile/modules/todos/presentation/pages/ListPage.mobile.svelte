<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Plus } from '@lucide/svelte';
	import { f7 } from 'framework7-svelte';
	import Page from '$mobile/ui/page.base.svelte';
	import Fab from '$mobile/ui/fab.base.svelte';
	import DataTable from '../components/DataTable.mobile.svelte';
	import { TodosListController } from '$modules/todos/domain/todo-route-controllers.svelte';

	const c = new TodosListController(); // shared with desktop
	// SvelteKit remounts this page on every return to it (e.g. after creating a todo),
	// so onMount already refetches; PTR handles manual refresh.
	onMount(() => c.load());

	async function remove(id: string) {
		await c.remove(id);
		f7.toast.show({ text: 'Todo deleted', closeTimeout: 2000 });
	}
</script>

<Page title="Todos" onrefresh={() => c.load()}>
	<!-- DataTable owns all table UI/UX (filter, count, skeleton/empty/rows);
	     this page only wires the controller. -->
	<DataTable
		todos={c.todos}
		visible={c.visible}
		loading={c.loading}
		error={c.error}
		filter={c.filter}
		remaining={c.remaining}
		onfilter={(f) => (c.filter = f)}
		ontoggle={(t) => c.toggle(t)}
		onremove={remove}
	/>
	<Fab onclick={() => goto('/todos/new')}><Plus /></Fab>
</Page>
