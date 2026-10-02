export type { Todo, TodoPriority, CreateTodoDto, UpdateTodoDto } from '$network';

export type TodoFilter = 'all' | 'active' | 'completed';
export type TodoFormErrors = Partial<Record<'title' | 'description' | 'dueDate', string>>;
