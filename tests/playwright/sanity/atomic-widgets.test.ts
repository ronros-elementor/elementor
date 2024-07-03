import WpAdminPage from '../pages/wp-admin-page';
import { parallelTest as test } from '../parallelTest';
import { expect } from '@playwright/test';

test.describe( 'Atomic Widgets', () => {
	let editor;
	let wpAdmin;

	const atomicWidgets = [
		{ name: 'a-heading', title: 'Atomic Heading' },
	];

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();

		const page = await context.newPage();

		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await enableRequiredExperiments();

		editor = await wpAdmin.openNewPage();
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();
	} );

	atomicWidgets.forEach( ( widget ) => {
		test.describe( widget.name, () => {
			test( 'Check widget is displayed in panel', async () => {
				const layout = editor.page.locator( '#elementor-panel-category-general' );
				await layout.isVisible();
				const container = await layout.locator( '.title', { hasText: widget.title } );
				await expect( container ).toBeVisible();
			} );

			test( 'Check widget is displayed in editor', async () => {
				const widgetId = await editor.addWidget( widget.name );
				const widgetSelector = '.elementor-element-' + widgetId;
				await expect( editor.getPreviewFrame().locator( widgetSelector ) ).toBeVisible();
			} );
		} );
	} );

	async function enableRequiredExperiments() {
		await wpAdmin.setExperiments( {
			editor_v2_elements: 'active',
		} );
	}
} );

