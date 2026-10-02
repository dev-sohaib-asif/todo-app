export type UiMode = 'mobile' | 'desktop';

/**
 * Decides once at startup which UI to show. Phones and tablets get Framework7,
 * everything else gets shadcn. Never based on width alone (narrow desktop windows stay desktop).
 * Override for testing: ?ui=mobile|desktop (remembered for the session) or VITE_FORCE_UI.
 */
export function detectUiMode(): UiMode {
	const q = new URLSearchParams(location.search).get('ui');
	if (q === 'mobile' || q === 'desktop') sessionStorage.setItem('ui', q);
	const forced = sessionStorage.getItem('ui') ?? import.meta.env.VITE_FORCE_UI;
	if (forced === 'mobile' || forced === 'desktop') return forced;

	const coarse = matchMedia('(pointer: coarse)').matches && matchMedia('(hover: none)').matches;
	const ua = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
	const ipadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1; // iPadOS reports as Mac
	return coarse || ua || ipadOS ? 'mobile' : 'desktop';
}
