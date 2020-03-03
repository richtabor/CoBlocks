/*
 * Include our constants
 */
import * as helpers from '../../../.dev/tests/cypress/helpers';

describe( 'Extension: CoBlocks Settings', function() {
	let supportsGradients = false;
	beforeEach( function() {
		cy.get( '.edit-post-more-menu' ).click();
		cy.get( '.components-menu-group' ).find( 'button' ).contains( 'Editor settings' ).click();
		cy.get( '.coblocks-modal__content' ).find( 'input[type="checkbox"]' ).each( ( checkbox ) => {
			if ( ! Cypress.$( checkbox ).prop( 'checked' ) ) {
				cy.get( checkbox ).click();
			}

			if ( Cypress.$( checkbox ).parents( '.components-base-control__field' ).text() === 'Gradient styles' ) {
				supportsGradients = true;
			}
		} );
		cy.get( '.components-modal__header' ).find( 'button[aria-label="Close dialog"]' ).click();
	} );

	// /**
	//  * Test that the CoBlocks panel may be hidden
	//  */
	// it( 'Can be filtered to be hidden.', function() {
	// 	helpers.addCoreBlockToPage( true, 'image' );

	// 	cy.get( '.replace-image-button' ).should( 'not.exist' );
	// } );

	// /**
	//  * Test that the CoBlocks panel may be renamed
	//  */
	// it( 'Can be filtered with a new title.', function() {
	// 	helpers.addCoreBlockToPage( true, 'image' );

	// 	cy.get( '.replace-image-button' ).should( 'not.exist' );
	// } );

	/**
	 * Test that the CoBlocks panel typography controls function as expected.
	 */
	it( 'Can control typography settings as expected.', function() {
		helpers.addCoBlocksBlockToPage( true, 'row' );
		cy.get( 'div[aria-label="Select Row Columns"]' ).find( 'div:nth-child(1) button' ).click( { force: true } );
		cy.get( '.wp-block-coblocks-row' ).click( { force: true } );

		cy.get( '.edit-post-more-menu' ).click();
		cy.get( '.components-menu-group' ).find( 'button' ).contains( 'Editor settings' ).click();

		// Typography Test
		cy.get( 'button[aria-label="Change typography"]' ).should( 'exist' );
		cy.get( '.coblocks-modal__content' ).contains( 'Typography controls' ).click();
		cy.get( 'button[aria-label="Change typography"]' ).should( 'not.exist' );

		cy.get( '.components-modal__header' ).find( 'button[aria-label="Close dialog"]' ).click();
	} );

	/**
	 * Test that the CoBlocks panel colors controls function as expected.
	 */
	it( 'Can control color settings as expected.', function() {
		helpers.addCoBlocksBlockToPage( true, 'hero' );
		cy.get( '.wp-block-button' ).first().click( { force: true } );
		helpers.openSettingsPanel( /background & text color/i );

		cy.get( '.edit-post-more-menu' ).click();
		cy.get( '.components-menu-group' ).find( 'button' ).contains( 'Editor settings' ).click();

		if ( supportsGradients ) {
			// Gradient Panels
			cy.get( '.block-editor-color-gradient-control button' ).contains( 'Gradient' ).should( 'exist' );
			cy.get( '.coblocks-modal__content' ).contains( 'Gradient styles' ).click();
			cy.get( '.block-editor-color-gradient-control button' ).contains( 'Gradient' ).should( 'not.exist' );
		}

		// Custom Color Picker
		cy.get( 'button[aria-label="Custom color picker"]' ).should( 'exist' );
		cy.get( '.coblocks-modal__content' ).contains( 'Custom color pickers' ).click();
		cy.get( 'button[aria-label="Custom color picker"]' ).should( 'not.exist' );

		// Color Settings
		cy.get( '.components-panel__body-title' ).contains( /background & text color/i ).should( 'exist' );
		cy.get( '.coblocks-modal__content' ).contains( 'Color settings' ).click();
		cy.get( '.components-panel__body-title' ).contains( /background & text color/i ).should( 'not.exist' );

		cy.get( '.components-modal__header' ).find( 'button[aria-label="Close dialog"]' ).click();
	} );
} );
