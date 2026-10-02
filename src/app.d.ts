declare global {
	namespace App {}
	interface ImportMetaEnv {
		readonly VITE_BASE_URL: string;
		readonly VITE_USE_MOCK: string;
	}
}
export {};
