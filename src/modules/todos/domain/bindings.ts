import type { TodoPriority } from './types';

export const priorityOptions: { value: TodoPriority; label: string }[] = [
	{ value: 'low', label: 'Low' },
	{ value: 'medium', label: 'Medium' },
	{ value: 'high', label: 'High' }
];

export const priorityBadge: Record<TodoPriority, 'secondary' | 'default' | 'destructive'> = {
	low: 'secondary',
	medium: 'default',
	high: 'destructive'
};
