/**
 * External dependencies
 */
import { JSDOM } from 'jsdom';
import '@testing-library/jest-dom/extend-expect';
import { omit } from 'lodash';
import { registerBlockType, unregisterBlockType, createBlock, serialize, parse } from '@wordpress/blocks';

/**
 * Internal dependencies.
 */
import { name, settings } from '../index';

// Make variables accessible for all tests.
let block;
let blockDOM;
let serializedBlock;

describe( 'coblocks/hero', () => {
	beforeAll( () => {
		// Register the block.
		registerBlockType( name, { category: 'common', ...settings } );
	} );

	beforeEach( () => {
		// Create the block with the minimum attributes.
		block = createBlock( name );

		// Reset the reused variables.
		blockDOM = undefined;
		serializedBlock = '';
	} );

	it( 'should render', () => {
		serializedBlock = serialize( block );

		expect( serializedBlock ).toBeDefined();
		expect( serializedBlock ).toMatchSnapshot();
	} );

	it( 'should apply hero-center-center-align class if the "Center Center" layout option is selected', () => {
		block.attributes.layout = 'center-center';
		serializedBlock = serialize( block );

		blockDOM = new JSDOM( serializedBlock );
		expect(
			blockDOM.window.document.querySelector( '.wp-block-coblocks-hero__inner' )
		).toHaveClass( `hero-${ block.attributes.layout }-align` );
	} );

	it( 'should apply has-no-padding class if the "none" padding setting is selected', () => {
		block.attributes.paddingSize = 'no';
		serializedBlock = serialize( block );

		blockDOM = new JSDOM( serializedBlock );
		expect(
			blockDOM.window.document.querySelector( '.wp-block-coblocks-hero__inner' )
		).toHaveClass( 'has-no-padding' );
	} );

	it( 'should apply has-padding class if any padding setting is applied', () => {
		block.attributes.paddingSize = 'advanced';
		serializedBlock = serialize( block );

		blockDOM = new JSDOM( serializedBlock );
		expect(
			blockDOM.window.document.querySelector( '.wp-block-coblocks-hero__inner' )
		).toHaveClass( 'has-padding' );
	} );

	it( 'should apply has-small-padding class if the small padding size is selected', () => {
		block.attributes.paddingSize = 'small';
		serializedBlock = serialize( block );

		blockDOM = new JSDOM( serializedBlock );
		expect(
			blockDOM.window.document.querySelector( '.wp-block-coblocks-hero__inner' )
		).toHaveClass( `has-${ block.attributes.paddingSize }-padding` );
	} );

	it( 'should set content max width with inline css', () => {
		block.attributes.maxWidth = 750;
		serializedBlock = serialize( block );

		blockDOM = new JSDOM( serializedBlock );
		expect(
			blockDOM.window.document.querySelector( '.wp-block-coblocks-hero__content' )
		).toHaveStyle( 'max-width: 750px' );
	} );

	it( 'should deprecate old version', () => {
		// Unregister the current block version.
		unregisterBlockType( name );

		// Register the v1 block.
		const v1Settings = Object.assign(
			{}, omit( settings, [ 'attributes', 'save', 'deprecated' ] ),
			{
				attributes: settings.deprecated[ 0 ].attributes,
				save: settings.deprecated[ 0 ].save,
			}
		);
		registerBlockType( name, { category: 'common', ...v1Settings } );

		// Create the block with the minimum attributes.
		const v1Block = createBlock( name );
		const v1Serialized = serialize( v1Block );

		// Unregister the v1 block version.
		unregisterBlockType( name );

		// Register the current block version.
		registerBlockType( name, { category: 'common', ...settings } );

		const blocks = parse( v1Serialized );

		for ( let i = 0; i < blocks.length; i++ ) {
			expect( blocks[ i ].isValid ).toBe( true );
		}
	} );
} );
