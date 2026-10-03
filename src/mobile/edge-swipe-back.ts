import { f7 } from 'framework7-svelte';
import type { F7Router } from './types';

const EDGE_PX = 24; // gesture must start this close to the left edge
const MIN_DX = 70; // and travel at least this far to the right
const MAX_DY = 60; // without drifting vertically more than this
const MAX_MS = 700; // within this time

/**
 * "Swipe from the left edge to go back". Calls the normal `router.back()` when a quick left-edge swipe to the
 * right is completed. It is not an interactive drag (the page does not follow your finger); it replaces
 * Framework7's own gesture, which needs `preloadPreviousPage` and broke Back in this app.
 * Returns a cleanup function.
 */
export function enableEdgeSwipeBack(): () => void {
	let start: { x: number; y: number; t: number } | null = null;

	const begin = (x: number, y: number) => {
		start = x <= EDGE_PX ? { x, y, t: Date.now() } : null;
	};
	const finish = (x: number, y: number) => {
		if (!start) return;
		const dx = x - start.x;
		const dy = Math.abs(y - start.y);
		const dt = Date.now() - start.t;
		start = null;
		if (dx < MIN_DX || dy > MAX_DY || dt > MAX_MS) return;
		const router = f7.views?.main?.router as unknown as F7Router | undefined;
		if (router && router.history.length > 1) router.back();
	};

	// Touch events (phones, tablets, DevTools touch emulation): still delivered when the browser starts panning.
	const onTouchStart = (e: TouchEvent) => begin(e.touches[0].clientX, e.touches[0].clientY);
	const onTouchEnd = (e: TouchEvent) => finish(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
	// Mouse (desktop browser using ?ui=mobile without touch emulation).
	const onPointerDown = (e: PointerEvent) => e.pointerType === 'mouse' && begin(e.clientX, e.clientY);
	const onPointerUp = (e: PointerEvent) => e.pointerType === 'mouse' && finish(e.clientX, e.clientY);
	const cancel = () => (start = null);

	document.addEventListener('touchstart', onTouchStart, { passive: true });
	document.addEventListener('touchend', onTouchEnd, { passive: true });
	document.addEventListener('touchcancel', cancel, { passive: true });
	document.addEventListener('pointerdown', onPointerDown, { passive: true });
	document.addEventListener('pointerup', onPointerUp, { passive: true });

	return () => {
		document.removeEventListener('touchstart', onTouchStart);
		document.removeEventListener('touchend', onTouchEnd);
		document.removeEventListener('touchcancel', cancel);
		document.removeEventListener('pointerdown', onPointerDown);
		document.removeEventListener('pointerup', onPointerUp);
	};
}
