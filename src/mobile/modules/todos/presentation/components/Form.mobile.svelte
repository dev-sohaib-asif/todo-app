<script lang="ts">
	import { untrack } from 'svelte';
	import List from '$mobile/ui/list.base.svelte';
	import Field from '$mobile/ui/field.base.svelte';
	import Button from '$mobile/ui/button.base.svelte';
	import { validateTodo } from '$modules/todos/domain/validator';
	import { emptyTodoForm } from '$modules/todos/domain/form';
	import { priorityOptions } from '$modules/todos/domain/bindings';
	import type { CreateTodoDto, TodoFormErrors, TodoPriority } from '$modules/todos/domain/types';

	let {
		initial,
		submitLabel = 'Save',
		busy = false,
		error = null,
		onsubmit
	}: {
		initial?: CreateTodoDto;
		submitLabel?: string;
		busy?: boolean;
		/** Save/create failure message from the page's submit handler; rendered here so ALL form UX lives in this component. */
		error?: string | null;
		onsubmit: (dto: CreateTodoDto) => void;
	} = $props();

	// Intentional: the form is seeded once from `initial`; later edits belong to the user.
	let form = $state<CreateTodoDto>(untrack(() => ({ ...emptyTodoForm(), ...initial })));
	let errors = $state<TodoFormErrors>({});

	function submit() {
		errors = validateTodo(form);
		if (Object.keys(errors).length === 0)
			onsubmit({ ...form, title: form.title.trim(), dueDate: form.dueDate || null });
	}
</script>

{#if error}<p class="p-4 text-red-600">{error}</p>{/if}
<List>
	<Field label="Title" bind:value={form.title} error={errors.title} clearable />
	<Field label="Description" type="textarea" bind:value={form.description} error={errors.description} />
	<Field
		label="Priority"
		type="select"
		options={priorityOptions}
		bind:value={() => form.priority, (v) => (form.priority = v as TodoPriority)}
	/>
	<Field label="Due date" type="date" bind:value={() => form.dueDate ?? '', (v) => (form.dueDate = v || null)} error={errors.dueDate} />
</List>
<div class="p-4">
	<Button fill disabled={busy} onclick={submit}>{busy ? 'Saving…' : submitLabel}</Button>
</div>
