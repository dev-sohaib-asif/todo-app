<script lang="ts">
	import { ListInput } from 'framework7-svelte';

	let {
		value = $bindable(''),
		label,
		type = 'text',
		options,
		error
	}: {
		value?: string;
		label: string;
		type?: 'text' | 'textarea' | 'date' | 'select';
		options?: { value: string; label: string }[];
		error?: string;
	} = $props();
</script>

<ListInput
	{label}
	{type}
	{value}
	onInput={(e: Event) => (value = (e.target as HTMLInputElement).value)}
	errorMessage={error}
	errorMessageForce={!!error}
>
	{#if type === 'select'}
		{#each options ?? [] as o}<option value={o.value} selected={o.value === value}>{o.label}</option>{/each}
	{/if}
</ListInput>
