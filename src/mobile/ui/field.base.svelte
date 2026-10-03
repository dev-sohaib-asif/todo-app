<script lang="ts">
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
	const id = $props.id();
</script>

<!--
	Native form controls inside Framework7's list-input CSS classes. Framework7's <ListInput> did not
	reliably deliver input events to the form here, so nothing was ever stored (and saving failed).
	Native `bind:value` always updates. Must be used inside the List wrapper (renders the <ul>).
-->
<li>
	<div class="item-content item-input" class:item-input-with-error-message={!!error} class:item-input-invalid={!!error}>
		<div class="item-inner">
			<label class="item-title item-label" for={id}>{label}</label>
			<div class="item-input-wrap">
				{#if type === 'textarea'}
					<textarea {id} bind:value></textarea>
				{:else if type === 'select'}
					<select {id} bind:value>
						{#each options ?? [] as o}<option value={o.value}>{o.label}</option>{/each}
					</select>
				{:else if type === 'date'}
					<input {id} type="date" bind:value />
				{:else}
					<input {id} type="text" bind:value />
				{/if}
				{#if error}<div class="item-input-error-message">{error}</div>{/if}
			</div>
		</div>
	</div>
</li>
