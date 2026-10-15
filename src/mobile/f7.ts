import Framework7 from 'framework7/lite-bundle';
import Framework7Svelte from 'framework7-svelte';

Framework7.use(Framework7Svelte);

export const f7params = {
  name: 'Todo App',
  theme: 'auto', // iOS look on iPhone/iPad, Material on Android
  darkMode: 'auto', // adds `dark` class on <html>, which shadcn also keys off
  // Framework7 must never intercept clicks: SvelteKit owns navigation (URLs, history, routes).
  // With every <a> treated as external, F7's document click handler returns before preventDefault,
  // so SvelteKit's link handling runs untouched.
  clicks: { externalLinks: 'a' }
};
