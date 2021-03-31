/*
 * Include our constants
 */
import * as helpers from '../../../../.dev/tests/cypress/helpers';
import 'cypress-file-upload';

describe( 'Test CoBlocks Gallery Collage Block', function() {
	/**
	 * Setup Gallery data
	 */
	const galleryData = {
		caption: 'Caption Here',
	};

	/**
	 * Test that we can add a gallery-collage block to the content, not add any images or
	 * alter any settings, and are able to successfully save the block without errors.
	 */
	it( 'Test collage block saves with empty values.', function() {
		helpers.addBlockToPost( 'coblocks/gallery-collage', true );

		helpers.savePage();

		helpers.checkForBlockErrors( 'coblocks/gallery-collage' );

		helpers.viewPage();

		cy.get( '.wp-block-coblocks-gallery-collage' ).find( 'ul>li' ).each( ( $item ) => {
			cy.get( $item ).should( 'be.empty' );
		} );

		helpers.editPage();
	} );

	/**
	 * Test that we can upload images to block and are able
	 * to successfully save the block without errors.
	 */
	it( 'Test collage block saves with image upload.', function() {
		const { imageBase } = helpers.upload.spec;
		helpers.addBlockToPost( 'coblocks/gallery-collage', true );

		cy.get( '[data-type="coblocks/gallery-collage"]' ).first().click();

		helpers.upload.imageToBlock( 'coblocks/gallery-collage' );

		cy.get( '.wp-block-coblocks-gallery-collage__item img[src*="http"]' ).should( 'have.attr', 'src' ).should( 'include', imageBase );

		helpers.savePage();

		helpers.checkForBlockErrors( 'coblocks/gallery-collage' );
	} );

	/**
	 * Test that we can add image from library and are able
	 * to successfully save the block without errors.
	 */
	it( 'Test collage block saves with images from media library.', function() {
		helpers.addBlockToPost( 'coblocks/gallery-collage', true );

		cy.get( '[data-type="coblocks/gallery-collage"]' )
			.first()
			.click()
			.contains( /media library/i )
			.click();

		cy.get( '.media-modal-content' ).contains( /media library/i ).click();

		cy.get( '.media-modal-content' ).find( 'li.attachment' )
			.first( 'li' )
			.click();

		cy.get( '.media-modal-content' ).find( '.media-button-select' ).click();

		helpers.savePage();

		helpers.checkForBlockErrors( 'coblocks/gallery-collage' );
	} );

	/**
	 * Test that we can add image captions
	 * to successfully save the block without errors.
	 */
	it( 'Test collage block saves with images captions.', function() {
		const { caption } = galleryData;
		helpers.addBlockToPost( 'coblocks/gallery-collage', true );

		cy.get( '[data-type="coblocks/gallery-collage"]' )
			.first()
			.click()
			.contains( /media library/i )
			.click();

		cy.get( '.media-modal-content' ).contains( /media library/i ).click();

		cy.get( '.media-modal-content' ).find( 'li.attachment' )
			.first( 'li' )
			.click();

		cy.get( '.media-modal-content' ).find( '.media-button-select' ).click();

		helpers.toggleSettingCheckbox( /captions/i );

		cy.get( '.wp-block-coblocks-gallery-collage__item' ).first().click()
			.find( 'figcaption' ).focus().type( caption, { force: true } );

		helpers.savePage();

		helpers.checkForBlockErrors( 'coblocks/gallery-collage' );
	} );

	/**
	 * Test that we can add image captions with rich text options
	 * No assertion that rich text options do not exist.
	 * Collage block has always-focused rich text options.
	 */
	it( 'Test collage captions allow rich text controls.', function() {
		helpers.addBlockToPost( 'coblocks/gallery-collage', true );

		cy.get( '[data-type="coblocks/gallery-collage"]' )
			.first()
			.click()
			.contains( /media library/i )
			.click();

		cy.get( '.media-modal-content' ).contains( /media library/i ).click();

		cy.get( '.media-modal-content' ).find( 'li.attachment' )
			.first( 'li' )
			.click();

		cy.get( '.media-modal-content' ).find( '.media-button-select' ).click();

		helpers.toggleSettingCheckbox( /captions/i );

		cy.get( '.wp-block-coblocks-gallery-collage__item' ).first().click()
			.find( 'figcaption' ).focus();

		cy.get( '[data-type="coblocks/gallery-collage"]' ).find( 'figcaption' ).focus();

		cy.get( '.block-editor-format-toolbar' );

		helpers.savePage();

		helpers.checkForBlockErrors( 'coblocks/gallery-collage' );
	} );

	it( 'can replace the existing image through the "Replace" button', () => {
		helpers.addBlockToPost( 'coblocks/gallery-collage', true );

		helpers.upload.imageReplaceFlow( 'coblocks/gallery-collage' );

		helpers.checkForBlockErrors( 'coblocks/gallery-collage' );

		helpers.savePage();

		helpers.checkForBlockErrors( 'coblocks/gallery-collage' );
	} );
} );
