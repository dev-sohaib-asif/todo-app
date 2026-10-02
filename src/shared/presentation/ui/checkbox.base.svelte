<script lang="ts">
	import { Checkbox } from '$shared/presentation/ui/shadcn-ui/checkbox/index.js';

	let {
		checked = false,
		label,
		onchange
	}: { checked?: boolean; label: string; onchange?: () => void } = $props();
</script>

<Checkbox {checked} aria-label={label} onCheckedChange={() => onchange?.()} />
