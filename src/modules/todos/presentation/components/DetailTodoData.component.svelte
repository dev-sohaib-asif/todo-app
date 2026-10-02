<script lang="ts">
	import Badge from '$shared/presentation/ui/badge.base.svelte';
	import FormCard from '$shared/presentation/ui/form-card.base.svelte';
	import { priorityBadge } from '../../domain/bindings';
	import type { Todo } from '../../domain/types';

	let { todo }: { todo: Todo } = $props();
	const fmt = (iso: string) => new Date(iso).toLocaleString();
</script>

<FormCard>
	<dl class="grid gap-3 text-sm">
		<div><dt class="text-muted-foreground">Status</dt><dd>{todo.completed ? 'Completed' : 'Active'}</dd></div>
		<div><dt class="text-muted-foreground">Priority</dt><dd><Badge variant={priorityBadge[todo.priority]}>{todo.priority}</Badge></dd></div>
		<div><dt class="text-muted-foreground">Due date</dt><dd>{todo.dueDate ?? '—'}</dd></div>
		<div><dt class="text-muted-foreground">Description</dt><dd class="whitespace-pre-wrap">{todo.description || '—'}</dd></div>
		<div><dt class="text-muted-foreground">Created</dt><dd>{fmt(todo.createdAt)}</dd></div>
		<div><dt class="text-muted-foreground">Updated</dt><dd>{fmt(todo.updatedAt)}</dd></div>
	</dl>
</FormCard>
