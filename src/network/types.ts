// API contract. Keep in sync with the real backend later.
export type TodoPriority = 'low' | 'medium' | 'high';

export interface Todo {
	id: string;
	title: string;
	description: string;
	completed: boolean;
	priority: TodoPriority;
	/** ISO date (YYYY-MM-DD) or null */
	dueDate: string | null;
	/** ISO datetime */
	createdAt: string;
	updatedAt: string;
}

/** POST /todos */
export type CreateTodoDto = Pick<Todo, 'title' | 'description' | 'priority' | 'dueDate'>;
/** PATCH /todos/:id */
export type UpdateTodoDto = Partial<CreateTodoDto & Pick<Todo, 'completed'>>;

/** Contract every backend/mock implementation must satisfy. */
export interface TodosApi {
	list(): Promise<Todo[]>; // GET    /todos
	get(id: string): Promise<Todo>; // GET    /todos/:id
	create(dto: CreateTodoDto): Promise<Todo>; // POST   /todos
	update(id: string, dto: UpdateTodoDto): Promise<Todo>; // PATCH  /todos/:id
	remove(id: string): Promise<void>; // DELETE /todos/:id
}

export class ApiError extends Error {
	constructor(
		message: string,
		public status: number
	) {
		super(message);
	}
}
