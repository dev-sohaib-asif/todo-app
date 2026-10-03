import { ApiError, type TodosApi, type Todo } from '../types';
import { todosSeed } from './todos.seed';

let db: Todo[] = structuredClone(todosSeed); // in-memory, resets on reload
// crypto.randomUUID() is undefined on insecure origins (e.g. http://192.168.x.x:5173 on a phone).
const newId = () =>
	globalThis.crypto?.randomUUID?.() ?? `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const find = (id: string) => {
	const t = db.find((x) => x.id === id);
	if (!t) throw new ApiError('Todo not found', 404);
	return t;
};

export const todosMock: TodosApi = {
	async list() {
		await delay();
		return structuredClone(db).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	},
	async get(id) {
		await delay();
		return structuredClone(find(id));
	},
	async create(dto) {
		await delay();
		const now = new Date().toISOString();
		const todo: Todo = { id: newId(), completed: false, createdAt: now, updatedAt: now, ...dto };
		db = [todo, ...db];
		return structuredClone(todo);
	},
	async update(id, dto) {
		await delay(120);
		const t = find(id);
		Object.assign(t, dto, { updatedAt: new Date().toISOString() });
		return structuredClone(t);
	},
	async remove(id) {
		await delay(120);
		find(id);
		db = db.filter((x) => x.id !== id);
	}
};
