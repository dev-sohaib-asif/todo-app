import type { CreateTodoDto } from './types';

export const emptyTodoForm = (): CreateTodoDto => ({
	title: '',
	description: '',
	priority: 'medium',
	dueDate: null
});
