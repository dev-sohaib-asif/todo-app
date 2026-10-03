declare global {
	namespace App {
		/** Shallow-routing state. `f7guard` marks the history entry used to catch the browser/system back button on mobile. */
		interface PageState {
			f7guard?: boolean;
		}
	}
	interface ImportMetaEnv {
		readonly VITE_BASE_URL: string;
		readonly VITE_USE_MOCK: string;
		readonly VITE_FORCE_UI?: 'mobile' | 'desktop' | '';
	}
}
export {};
