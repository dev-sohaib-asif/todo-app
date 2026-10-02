<script lang="ts">
	import { Textarea } from '$shared/presentation/ui/shadcn-ui/textarea/index.js';

	let {
		value = $bindable(''),
		label,
		error,
		placeholder = '',
		rows = 4
	}: { value?: string; label?: string; error?: string; placeholder?: string; rows?: number } = $props();
	const uid = $props.id();
</script>

<div class="grid gap-1.5">
	{#if label}<label for={uid} class="text-sm font-medium">{label}</label>{/if}
	<Textarea id={uid} {placeholder} {rows} bind:value aria-invalid={!!error} />
	{#if error}<p class="text-destructive text-sm">{error}</p>{/if}
</div>
