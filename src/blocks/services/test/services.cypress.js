/*
 * Include our constants
 */
import * as helpers from '../../../../.dev/tests/cypress/helpers';

describe( 'Test CoBlocks Services Block', function() {
	/**
	 * Test that we can add a services block to the content, not alter
	 * any settings, and are able to successfully save the block without errors.
	 */
	it( 'Test services block saves with empty values.', function() {
		helpers.addBlockToPost( 'coblocks/services', true );

		helpers.savePage();

		helpers.checkForBlockErrors( 'coblocks/services' );

		helpers.viewPage();

		cy.get( '.wp-block-coblocks-services' ).should( 'exist' );

		helpers.editPage();
	} );

	/**
	 * Test that we can add a services block to the content, change
	 * column count and  are able to successfully save the block without errors.
	 */
	it( 'Test services block saves with columns attribute.', function() {
		helpers.addBlockToPost( 'coblocks/services', true );

		cy.get( '.wp-block-coblocks-services' ).click( { force: true } );

		cy.get( '.wp-block-coblocks-service' ).should( 'have.length', 2 );

		helpers.setInputValue( 'Services settings', 'Columns', 1, false );

		cy.get( '.wp-block-coblocks-service' ).should( 'have.length', 2 ); // No longer pops children out of block.

		helpers.setInputValue( 'Services settings', 'Columns', 3, false );

		cy.get( '.wp-block-coblocks-service' ).should( 'have.length', 3 );

		helpers.setInputValue( 'Services settings', 'Columns', 4, false );

		cy.get( '.wp-block-coblocks-service' ).should( 'have.length', 4 );

		cy.get( 'h3 > [data-rich-text-placeholder="Write title…"]' ).parent().each( ( $serviceHeading, index ) => {
			cy.get( $serviceHeading ).click( { force: true } ).type( `Service ${ index }` );
		} );

		helpers.savePage();

		helpers.checkForBlockErrors( 'coblocks/services' );

		helpers.viewPage();

		cy.get( '.wp-block-coblocks-service' ).should( 'have.length', 4 );

		helpers.editPage();
	} );

	/**
	 * Test that we can add a services block to the content, change
	 * heading level and  are able to successfully save the block without errors.
	 */
	it( 'Test services block saves with heading level set.', function() {
		helpers.addBlockToPost( 'coblocks/services', true );

		cy.get( '.edit-post-visual-editor [data-type="coblocks/services"]' ).click();
		helpers.openHeadingToolbarAndSelect( 2 );
		cy.get( '.edit-post-visual-editor [data-type="coblocks/services"] h2' ).should( 'exist' );
		helpers.openHeadingToolbarAndSelect( 3 );
		cy.get( '.edit-post-visual-editor [data-type="coblocks/services"] h3' ).should( 'exist' );
		helpers.openHeadingToolbarAndSelect( 4 );
		cy.get( '.edit-post-visual-editor [data-type="coblocks/services"] h4' ).should( 'exist' );
		helpers.openHeadingToolbarAndSelect( 5 );
		cy.get( '.edit-post-visual-editor [data-type="coblocks/services"] h5' ).should( 'exist' );

		helpers.savePage();
		helpers.checkForBlockErrors( 'coblocks/services' );
	} );

	/**
	 * Test that the service block move arrow orientation is correct
	 */
	it( 'Test service block has the proper arrow orientation.', function() {
		helpers.addBlockToPost( 'coblocks/services', true );

		cy.get( '.edit-post-visual-editor [data-type="coblocks/service"]:first-child' ).click();
		cy.get( 'div.block-editor-block-mover' ).should( 'have.class', 'is-horizontal' );

		cy.get( '.edit-post-visual-editor [data-type="coblocks/services"]' ).focus();
		helpers.setInputValue( 'Services settings', 'Columns', 1, false );

		cy.get( '.edit-post-visual-editor [data-type="coblocks/service"]:first-child' ).click();
		cy.get( 'div.block-editor-block-mover' ).should( 'not.have.class', 'is-horizontal' );

		helpers.savePage();
	} );

	/**
	 * Test that we can add a services block to the content, enable
	 * action buttons and  are able to successfully save the block without errors.
	 */
	it( 'Test services block saves with action buttons enabled.', function() {
		helpers.addBlockToPost( 'coblocks/services', true );

		cy.get( 'div.wp-block-button' ).should( 'not.exist' );

		helpers.toggleSettingCheckbox( /display buttons/i );

		cy.get( 'div.wp-block-button' ).should( 'exist' );

		helpers.savePage();

		helpers.checkForBlockErrors( 'coblocks/services' );
	} );

	/**
	 * Test the services block saves with custom classes
	 */
	it( 'Test the services block custom classes.', function() {
		helpers.addBlockToPost( 'coblocks/services', true );

		helpers.addCustomBlockClass( 'my-custom-class', 'services' );

		helpers.savePage();

		helpers.checkForBlockErrors( 'coblocks/services' );

		cy.get( '.wp-block-coblocks-services' )
			.should( 'have.class', 'my-custom-class' );

		helpers.viewPage();

		cy.get( '.wp-block-coblocks-services' )
			.should( 'have.class', 'my-custom-class' );

		helpers.editPage();
	} );
} );
