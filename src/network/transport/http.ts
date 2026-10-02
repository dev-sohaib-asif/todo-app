import { ApiError } from '../types';

export const BASE_URL: string = import.meta.env.VITE_BASE_URL ?? '';
export const USE_MOCK: boolean = import.meta.env.VITE_USE_MOCK !== 'false';

/** Extension point: add auth headers here when you wire up auth. */
function defaultHeaders(): Record<string, string> {
	return { 'Content-Type': 'application/json' };
}

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
	const res = await fetch(`${BASE_URL}${path}`, {
		...init,
		headers: { ...defaultHeaders(), ...(init.headers as Record<string, string>) }
	});
	if (!res.ok) throw new ApiError((await res.text()) || res.statusText, res.status);
	return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}
