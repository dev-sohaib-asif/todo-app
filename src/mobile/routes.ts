// Same paths as the SvelteKit routes. Order matters: 'new' before ':id'.

export default [
	{ path: '/todos/', asyncComponent: () => import('./modules/todos/presentation/pages/ListPage.mobile.svelte') },
	{ path: '/todos/new/', asyncComponent: () => import('./modules/todos/presentation/pages/NewPage.mobile.svelte') },
	{ path: '/todos/:id/', asyncComponent: () => import('./modules/todos/presentation/pages/DetailPage.mobile.svelte') },
	{ path: '/todos/:id/edit/', asyncComponent: () => import('./modules/todos/presentation/pages/EditPage.mobile.svelte') }
];
