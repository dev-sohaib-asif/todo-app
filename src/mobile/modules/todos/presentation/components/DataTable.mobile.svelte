<script lang="ts">
	import { SkeletonText } from 'framework7-svelte';
	import TodosData from './TodosData.mobile.svelte';
	import type { Todo, TodoFilter } from '$modules/todos/domain/types';

	// The todos "data table": everything ListPage shows between the navbar and the
	// FAB — segmented filter, remaining counter, error line, and the three data
	// states (loading skeleton / empty hint / rows). Pure presentational: the page
	// owns the controller and passes state + callbacks down.
	let {
		todos,
		visible,
		loading,
		error,
		filter,
		remaining,
		onfilter,
		ontoggle,
		onremove
	}: {
		todos: Todo[];
		visible: Todo[];
		loading: boolean;
		error: string | null;
		filter: TodoFilter;
		remaining: number;
		onfilter: (f: TodoFilter) => void;
		ontoggle: (t: Todo) => void;
		onremove: (id: string) => void;
	} = $props();

	const filters: { value: TodoFilter; label: string }[] = [
		{ value: 'all', label: 'All' },
		{ value: 'active', label: 'Active' },
		{ value: 'completed', label: 'Done' }
	];
</script>

<div class="segmented segment-colored mx-4 my-2">
	{#each filters as f}
		<button
			type="button"
			class="button"
			class:active={filter === f.value}
			aria-pressed={filter === f.value}
			onclick={() => onfilter(f.value)}
		>
			{f.label}
		</button>
	{/each}
</div>
<p class="px-4 pt-1 text-sm opacity-70">{remaining} remaining</p>
{#if error}<p class="p-4 text-red-600">{error}</p>{/if}
{#if loading && todos.length === 0}
	<!-- F7's own SkeletonText component (framework7-svelte -> skeleton-elements):
	     renders <span class="skeleton-text skeleton-effect-wave"> and sizes the
	     placeholder bar from the slot text length. Per-bar effect (official F7
	     Svelte pattern) instead of waving the whole <ul>. -->
	<ul class="list">
		{#each Array(6) as _}
			<li>
				<div class="item-content">
					<div class="item-inner"><SkeletonText effect="wave">Todo title placeholder</SkeletonText></div>
				</div>
			</li>
		{/each}
	</ul>
{:else if visible.length === 0}
	<p class="p-4 opacity-70">Nothing here. Tap + to add a todo.</p>
{:else}
	<TodosData todos={visible} {ontoggle} {onremove} />
{/if}
