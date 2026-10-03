/** Minimal shapes of the props Framework7 passes to routed pages. */
export interface F7Router {
	navigate(url: string): void;
	back(): void;
	/** F7's history for this view; the current page is the last entry. */
	history: string[];
}
export interface F7Route {
	params: Record<string, string>;
}
