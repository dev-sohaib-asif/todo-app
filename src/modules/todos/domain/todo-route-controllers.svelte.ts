import { todoApi } from '../data/api';
import type { Todo, TodoFilter } from './types';

const msg = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');

export class TodosListController {
	todos = $state<Todo[]>([]);
	loading = $state(true);
	error = $state<string | null>(null);
	filter = $state<TodoFilter>('all');

	visible = $derived(
		this.todos.filter((t) =>
			this.filter === 'all' ? true : this.filter === 'completed' ? t.completed : !t.completed
		)
	);
	remaining = $derived(this.todos.filter((t) => !t.completed).length);

	async load() {
		this.loading = true;
		this.error = null;
		try {
			this.todos = await todoApi.list();
		} catch (e) {
			this.error = msg(e);
		} finally {
			this.loading = false;
		}
	}

	async toggle(todo: Todo) {
		const prev = todo.completed;
		todo.completed = !prev; // optimistic
		try {
			await todoApi.update(todo.id, { completed: !prev });
		} catch (e) {
			todo.completed = prev;
			this.error = msg(e);
		}
	}

	async remove(id: string) {
		try {
			await todoApi.remove(id);
			this.todos = this.todos.filter((t) => t.id !== id);
		} catch (e) {
			this.error = msg(e);
		}
	}
}

export class TodoItemController {
	todo = $state<Todo | null>(null);
	loading = $state(true);
	error = $state<string | null>(null);

	async load(id: string) {
		this.loading = true;
		this.error = null;
		try {
			this.todo = await todoApi.get(id);
		} catch (e) {
			this.error = msg(e);
		} finally {
			this.loading = false;
		}
	}
}
