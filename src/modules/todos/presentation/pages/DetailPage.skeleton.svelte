<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import PageHeader from '$shared/presentation/ui/page-header.base.svelte';
	import Button from '$shared/presentation/ui/button.base.svelte';
	import DetailTodoData from '../components/DetailTodoData.component.svelte';
	import { TodoItemController } from '../../domain/todo-route-controllers.svelte';

	const c = new TodoItemController();
	onMount(() => c.load(page.params.id!));
</script>

{#if c.loading}
	<p class="text-muted-foreground text-sm">Loading…</p>
{:else if c.error || !c.todo}
	<p class="text-destructive text-sm">{c.error ?? 'Not found'}</p>
{:else}
	<PageHeader title={c.todo.title}>
		{#snippet actions()}
			<Button variant="outline" href="/todos">Back</Button>
			<Button href="/todos/{c.todo!.id}/edit">Edit</Button>
		{/snippet}
	</PageHeader>
	<DetailTodoData todo={c.todo} />
{/if}
