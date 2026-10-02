<script lang="ts">
	import { Input } from '$shared/presentation/ui/shadcn-ui/input/index.js';

	let {
		value = $bindable(''),
		label,
		error,
		type = 'text',
		placeholder = '',
		id
	}: { value?: string; label?: string; error?: string; type?: string; placeholder?: string; id?: string } = $props();
	const uid = $props.id();
</script>

<div class="grid gap-1.5">
	{#if label}<label for={id ?? uid} class="text-sm font-medium">{label}</label>{/if}
	<Input id={id ?? uid} {type} {placeholder} bind:value aria-invalid={!!error} />
	{#if error}<p class="text-destructive text-sm">{error}</p>{/if}
</div>
