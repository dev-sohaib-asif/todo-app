<script lang="ts">
	import { Trash2, Pencil } from '@lucide/svelte';
	import Button from '$shared/presentation/ui/button.base.svelte';
	import Badge from '$shared/presentation/ui/badge.base.svelte';
	import Checkbox from '$shared/presentation/ui/checkbox.base.svelte';
	import { priorityBadge } from '../../domain/bindings';
	import type { Todo } from '../../domain/types';

	let {
		todos,
		ontoggle,
		onremove
	}: { todos: Todo[]; ontoggle: (t: Todo) => void; onremove: (id: string) => void } = $props();
</script>

<ul class="divide-y rounded-lg border">
	{#each todos as todo (todo.id)}
		<li class="flex items-center gap-3 p-3">
			<Checkbox checked={todo.completed} label="Toggle {todo.title}" onchange={() => ontoggle(todo)} />
			<a href="/todos/{todo.id}" class="min-w-0 flex-1">
				<p class="truncate font-medium {todo.completed ? 'text-muted-foreground line-through' : ''}">{todo.title}</p>
				{#if todo.dueDate}<p class="text-muted-foreground text-xs">Due {todo.dueDate}</p>{/if}
			</a>
			<Badge variant={priorityBadge[todo.priority]}>{todo.priority}</Badge>
			<Button variant="ghost" size="icon" href="/todos/{todo.id}/edit"><Pencil class="size-4" /></Button>
			<Button variant="ghost" size="icon" onclick={() => onremove(todo.id)}><Trash2 class="size-4" /></Button>
		</li>
	{/each}
</ul>
