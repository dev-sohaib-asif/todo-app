declare global {
	interface ImportMetaEnv {
		readonly VITE_BASE_URL: string;
		readonly VITE_USE_MOCK: string;
		readonly VITE_FORCE_UI?: 'mobile' | 'desktop' | '';
	}
}
export {};
