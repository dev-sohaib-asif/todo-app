<script lang="ts">
	let {
		value = $bindable(''),
		label,
		type = 'text',
		options,
		error,
		clearable = false
	}: {
		value?: string;
		label: string;
		type?: 'text' | 'textarea' | 'date' | 'select';
		options?: { value: string; label: string }[];
		error?: string;
		/** Show Framework7's clear (×) button on text inputs when they have a value. */
		clearable?: boolean;
	} = $props();
	const id = $props.id();

	// Framework7's Input module normally adds these on focus/blur; it never sees our
	// native inputs, so we replicate them (focused label, theme-color border, × button).
	let focused = $state(false);
	const onFocus = () => (focused = true);
	const onBlur = () => (focused = false);
</script>

<!--
	Native form controls inside Framework7's list-input CSS classes. Framework7's <ListInput> did not
	reliably deliver input events to the form here, so nothing was ever stored (and saving failed).
	Native `bind:value` always updates. Must be used inside the List wrapper (renders the <ul>).
-->
<li>
	<div
		class="item-content item-input"
		class:item-input-focused={focused}
		class:item-input-with-value={clearable && !!value}
		class:item-input-with-error-message={!!error}
		class:item-input-invalid={!!error}
	>
		<div class="item-inner">
			<label class="item-title item-label" for={id}>{label}</label>
			<div class="item-input-wrap">
				{#if type === 'textarea'}
					<textarea {id} bind:value onfocus={onFocus} onblur={onBlur} class:input-focused={focused}></textarea>
				{:else if type === 'select'}
					<select {id} bind:value onfocus={onFocus} onblur={onBlur} class:input-focused={focused}>
						{#each options ?? [] as o}<option value={o.value}>{o.label}</option>{/each}
					</select>
				{:else if type === 'date'}
					<input {id} type="date" bind:value onfocus={onFocus} onblur={onBlur} class:input-focused={focused} />
				{:else}
					<input {id} type="text" bind:value onfocus={onFocus} onblur={onBlur} class:input-focused={focused} />
					{#if clearable}
						<button
							type="button"
							class="input-clear-button"
							aria-label="Clear {label}"
							onclick={() => (value = '')}
						></button>
					{/if}
				{/if}
				{#if error}<div class="item-input-error-message">{error}</div>{/if}
			</div>
		</div>
	</div>
</li>
