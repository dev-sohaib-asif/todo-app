import type { CreateTodoDto, TodoFormErrors } from './types';

export function validateTodo(dto: CreateTodoDto): TodoFormErrors {
	const errors: TodoFormErrors = {};
	if (!dto.title.trim()) errors.title = 'Title is required';
	else if (dto.title.length > 120) errors.title = 'Max 120 characters';
	if (dto.description.length > 1000) errors.description = 'Max 1000 characters';
	if (dto.dueDate && Number.isNaN(Date.parse(dto.dueDate))) errors.dueDate = 'Invalid date';
	return errors;
}
