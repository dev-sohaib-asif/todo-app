<script lang="ts">
	import List from '$mobile/ui/list.base.svelte';
	import ListItem from '$mobile/ui/list-item.base.svelte';
	import type { Todo } from '$modules/todos/domain/types';

	let {
		todos,
		ontoggle,
		onremove
	}: { todos: Todo[]; ontoggle: (t: Todo) => void; onremove: (id: string) => void } = $props();
</script>

<List>
	{#each todos as todo (todo.id)}
		<ListItem
			title={todo.title}
			subtitle={todo.dueDate ? `Due ${todo.dueDate}` : undefined}
			after={todo.priority}
			href="/todos/{todo.id}/"
			checked={todo.completed}
			ontoggle={() => ontoggle(todo)}
			onremove={() => onremove(todo.id)}
		/>
	{/each}
</List>
