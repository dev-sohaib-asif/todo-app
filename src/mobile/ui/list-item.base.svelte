<script lang="ts">
	import { ListItem, SwipeoutActions, SwipeoutButton } from 'framework7-svelte';

	let {
		title,
		subtitle,
		after,
		href,
		checked,
		ontoggle,
		onremove
	}: {
		title: string;
		subtitle?: string;
		after?: string;
		href?: string;
		checked?: boolean;
		ontoggle?: () => void;
		onremove?: () => void;
	} = $props();
</script>

<ListItem
	{title}
	{subtitle}
	{after}
	link={href}
	checkbox={checked !== undefined}
	{checked}
	onChange={() => ontoggle?.()}
	swipeout={!!onremove}
>
	{#if onremove}
		<SwipeoutActions right>
			<SwipeoutButton delete confirmText="Delete this todo?" onClick={() => onremove?.()}>Delete</SwipeoutButton>
		</SwipeoutActions>
	{/if}
</ListItem>
