/** Minimal shapes of the props Framework7 passes to routed pages. */
export interface F7Router {
	navigate(url: string): void;
	back(): void;
}
export interface F7Route {
	params: Record<string, string>;
}
