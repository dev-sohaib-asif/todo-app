import type { Todo } from '../types';

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 864e5).toISOString();
const due = (days: number) => new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);

export const todosSeed: Todo[] = [
	{ id: 't1', title: 'Set up project structure', description: 'Create modules, network and shared folders.', completed: true, priority: 'high', dueDate: due(-2), createdAt: d(7), updatedAt: d(5) },
	{ id: 't2', title: 'Build the shadcn wrappers', description: 'Wrap shadcn-ui components in *.base.svelte files.', completed: true, priority: 'medium', dueDate: due(-1), createdAt: d(6), updatedAt: d(3) },
	{ id: 't3', title: 'Connect the real backend', description: 'Set VITE_USE_MOCK=false and point VITE_BASE_URL at the server.', completed: false, priority: 'high', dueDate: due(5), createdAt: d(4), updatedAt: d(4) },
	{ id: 't4', title: 'Add authentication', description: 'Plug auth headers into network/transport/http.ts.', completed: false, priority: 'medium', dueDate: due(10), createdAt: d(3), updatedAt: d(3) },
	{ id: 't5', title: 'Write the README', description: '', completed: false, priority: 'low', dueDate: null, createdAt: d(2), updatedAt: d(2) },
	{ id: 't6', title: 'Buy groceries', description: 'Milk, eggs, bread.', completed: false, priority: 'low', dueDate: due(1), createdAt: d(1), updatedAt: d(1) }
];
