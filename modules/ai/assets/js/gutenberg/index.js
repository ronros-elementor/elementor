import { createRoot } from '@wordpress/element';
import GenerateExcerptWithAI from './excerpt';
import GenerateFeaturedImageWithAI from './featured-image';

( function() {
	'use strict';

	// Wait for the Gutenberg editor to initialize
	wp.domReady( () => {
		// Define a function to add the custom link to the excerpt panel
		const addGenerateExcerptWithAI = () => {
			// Get the excerpt panel
			const excerptPanel = document.querySelector( '.editor-post-excerpt' );
			// Check if the excerpt panel exists and the custom link hasn't been added
			if ( excerptPanel && ! document.querySelector( '.e-excerpt-ai' ) ) {
				const rootElement = document.createElement( 'div' );
				rootElement.classList.add( 'e-excerpt-ai' );
				// Find the existing link with class "components-external-link"
				const existingExcerptLink = excerptPanel.querySelector( '.components-external-link' );
				if ( existingExcerptLink ) {
					existingExcerptLink.classList.add( 'existing-excerpt-link' );
					// Append the new link before the existing one
					excerptPanel.insertBefore( rootElement, existingExcerptLink );
				} else {
					// Append the new link to the excerpt panel
					excerptPanel.appendChild( rootElement );
				}

				const urlSearchParams = new URLSearchParams( window.location.search );
				elementorCommon?.ajax?.addRequestConstant( 'editor_post_id', urlSearchParams?.get( 'post' ) );

				const root = createRoot( rootElement );
				root.render( <GenerateExcerptWithAI /> );
			}
		};

		const addGenerateFeaturedImageWithAI = () => {
			const featuredImagePanel = document.querySelector( '.editor-post-featured-image' );
			if ( featuredImagePanel && ! document.querySelector( '.e-featured-image-ai' ) ) {
				const rootElement = document.createElement( 'div' );
				rootElement.classList.add( 'e-featured-image-ai' );
				featuredImagePanel.appendChild( rootElement );
				const postId = wp.data.select( 'core/editor' ).getCurrentPostId();
				elementorCommon?.ajax?.addRequestConstant( 'editor_post_id', postId );
				const root = createRoot( rootElement );
				root.render( <GenerateFeaturedImageWithAI /> );
			}
		};

		const addAiIndicator = ( panelName, functionAddAi ) => {
			const isSidebarOpened = wp.data.select( 'core/edit-post' )?.isEditorPanelOpened( panelName );
			if ( isSidebarOpened ) {
				setTimeout( function() {
					functionAddAi();
				}, 1 );
			}
		};

		wp.data.subscribe( () => {
			addAiIndicator( 'post-excerpt', addGenerateExcerptWithAI );
			addAiIndicator( 'featured-image', addGenerateFeaturedImageWithAI );
		} );
	} );
} )( jQuery );
