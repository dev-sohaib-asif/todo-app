import { http, USE_MOCK } from '../transport/http';
import { todosMock } from '../mock/todos.mock';
import type { TodosApi } from '../types';

const todosHttp: TodosApi = {
	list: () => http('/todos'),
	get: (id) => http(`/todos/${id}`),
	create: (dto) => http('/todos', { method: 'POST', body: JSON.stringify(dto) }),
	update: (id, dto) => http(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
	remove: (id) => http(`/todos/${id}`, { method: 'DELETE' })
};

export const todosApi: TodosApi = USE_MOCK ? todosMock : todosHttp;
