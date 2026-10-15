import { goBack } from './back';

/* ===========================================================================
   EDGE-SWIPE-BACK — restores Framework7's router swipe-back gesture.

   F7's router shipped an interactive "drag the page back" gesture; SvelteKit's
   router has no gesture at all. This is the replacement: the classic iOS
   "swipe from the left edge to go back".

   It is deliberately NON-interactive — the page does NOT follow your finger
   (no drag animation). It only DETECTS a completed swipe and then fires
   goBack() (the shared helper = exactly what the navbar back button calls).
   That keeps it from fighting:
     - pull-to-refresh (vertical drag inside the page),
     - swipe-to-delete on list rows (horizontal drag on a row),
     - Framework7's own touch/active-state listeners (all { passive: true }).
   And because it calls the same goBack(), one swipe can never go back twice.

   Who mounts it: ui/page.base.svelte — in onMount, ONLY when the page has the
   `back` prop (Detail/Edit/New). The list root has nothing to pop, so it never
   enables this. onMount's return value is the cleanup below, so listeners are
   removed on page unmount: exactly one page's listeners exist at any time.
   Lives in router_clone/application/ next to its helper back.ts.

   Detects both touch (real phones, DevTools touch emulation) and mouse-pointer
   events (desktop browser using ?ui=mobile without touch emulation).
   =========================================================================== */

const EDGE_PX = 24; // gesture must start this close to the left edge
const MIN_DX = 70; // and travel at least this far to the right
const MAX_DY = 60; // without drifting vertically more than this (else it's a scroll)
const MAX_MS = 700; // within this time (else it's not a deliberate gesture)

/**
 * Installs the left-edge swipe-to-go-back listeners on `document`.
 * Returns a cleanup function that removes them (call it when the page unmounts).
 */
export function enableEdgeSwipeBack(): () => void {
	let start: { x: number; y: number; t: number } | null = null;

	// ARM the gesture: only if the touch STARTED within 24px of the left screen edge.
	// Anything else (normal taps/swipes) sets nothing, so finish() is a no-op.
	const begin = (x: number, y: number) => {
		start = x <= EDGE_PX ? { x, y, t: Date.now() } : null;
	};
	// ON RELEASE: validate all four conditions, then perform the back navigation.
	const finish = (x: number, y: number) => {
		if (!start) return; // gesture never armed
		const dx = x - start.x;
		const dy = Math.abs(y - start.y);
		const dt = Date.now() - start.t;
		start = null;
		if (dx < MIN_DX || dy > MAX_DY || dt > MAX_MS) return; // not a valid swipe
		goBack(); // shared with the navbar back link (router_clone/application/back.ts)
	};

	// Touch events (phones, tablets, DevTools touch emulation): still delivered when the browser starts panning.
	const onTouchStart = (e: TouchEvent) => begin(e.touches[0].clientX, e.touches[0].clientY);
	const onTouchEnd = (e: TouchEvent) => finish(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
	// Mouse (desktop browser using ?ui=mobile without touch emulation) — only the
	// mouse pointer counts; touch also fires pointer events and must not double-fire.
	const onPointerDown = (e: PointerEvent) => e.pointerType === 'mouse' && begin(e.clientX, e.clientY);
	const onPointerUp = (e: PointerEvent) => e.pointerType === 'mouse' && finish(e.clientX, e.clientY);
	const cancel = () => (start = null); // gesture interrupted (e.g. touchcancel): never fire late

	document.addEventListener('touchstart', onTouchStart, { passive: true });
	document.addEventListener('touchend', onTouchEnd, { passive: true });
	document.addEventListener('touchcancel', cancel, { passive: true });
	document.addEventListener('pointerdown', onPointerDown, { passive: true });
	document.addEventListener('pointerup', onPointerUp, { passive: true });

	// Cleanup — page.base.svelte's onMount returns this, so Svelte calls it on
	// page unmount and the next page installs its own fresh listeners.
	return () => {
		document.removeEventListener('touchstart', onTouchStart);
		document.removeEventListener('touchend', onTouchEnd);
		document.removeEventListener('touchcancel', cancel);
		document.removeEventListener('pointerdown', onPointerDown);
		document.removeEventListener('pointerup', onPointerUp);
	};
}
