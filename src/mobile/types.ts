/** Minimal shapes of the props Framework7 passes to routed pages. */
export interface F7Router {
	navigate(url: string): void;
	/** With a url: used as the destination when there is no previous page in history. */
	back(url?: string): void;
}
export interface F7Route {
	params: Record<string, string>;
}
