<script lang="ts">
	import { untrack } from 'svelte';
	import Button from '$shared/presentation/ui/button.base.svelte';
	import Input from '$shared/presentation/ui/input.base.svelte';
	import Textarea from '$shared/presentation/ui/textarea.base.svelte';
	import FormCard from '$shared/presentation/ui/form-card.base.svelte';
	import { validateTodo } from '../../domain/validator';
	import { emptyTodoForm } from '../../domain/form';
	import { priorityOptions } from '../../domain/bindings';
	import type { CreateTodoDto, TodoFormErrors } from '../../domain/types';

	let {
		initial,
		submitLabel = 'Save',
		busy = false,
		onsubmit
	}: {
		initial?: CreateTodoDto;
		submitLabel?: string;
		busy?: boolean;
		onsubmit: (dto: CreateTodoDto) => void;
	} = $props();

	// Intentional: the form is seeded once from `initial`; later edits belong to the user.
	let form = $state<CreateTodoDto>(untrack(() => ({ ...emptyTodoForm(), ...initial })));
	let errors = $state<TodoFormErrors>({});

	function submit(e: SubmitEvent) {
		e.preventDefault();
		errors = validateTodo(form);
		if (Object.keys(errors).length === 0) onsubmit({ ...form, title: form.title.trim(), dueDate: form.dueDate || null });
	}
</script>

<form onsubmit={submit}>
	<FormCard>
		<div class="grid gap-4">
			<Input label="Title" bind:value={form.title} error={errors.title} placeholder="What needs doing?" />
			<Textarea label="Description" bind:value={form.description} error={errors.description} />
			<div class="grid gap-1.5">
				<span class="text-sm font-medium">Priority</span>
				<div class="flex gap-2">
					{#each priorityOptions as p}
						<Button size="sm" variant={form.priority === p.value ? 'default' : 'outline'} onclick={() => (form.priority = p.value)}>{p.label}</Button>
					{/each}
				</div>
			</div>
			<Input label="Due date" type="date" bind:value={() => form.dueDate ?? '', (v) => (form.dueDate = v || null)} error={errors.dueDate} />
			<div class="flex justify-end gap-2">
				<Button variant="ghost" href="/todos">Cancel</Button>
				<Button type="submit" disabled={busy}>{busy ? 'Saving…' : submitLabel}</Button>
			</div>
		</div>
	</FormCard>
</form>
