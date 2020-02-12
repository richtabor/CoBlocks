/**
 * External dependencies
 */
import '@testing-library/jest-dom/extend-expect';
import { registerBlockType, createBlock, serialize } from '@wordpress/blocks';

/**
 * Internal dependencies.
 */
import { name, settings } from '../index';

// Make variables accessible for all tests.
let block;
let serializedBlock;

describe( name, () => {
	beforeAll( () => {
		// Register the block.
		registerBlockType( name, { category: 'common', ...settings } );
	} );

	beforeEach( () => {
		// Create the block with the minimum attributes.
		block = createBlock( name );

		// Reset the reused variables.
		serializedBlock = '';
	} );

	it( 'should render', () => {
		serializedBlock = serialize( block );

		expect( serializedBlock ).toBeDefined();
		expect( serializedBlock ).toMatchSnapshot();
	} );

	it( 'should render heading levels', () => {
		[ 1, 2, 3, 4, 5, 6 ].forEach( headingLevel => {
			block.attributes.headingLevel = headingLevel;
			serializedBlock = serialize( block );
			expect( serializedBlock ).toBeDefined();
			if ( 4 !== headingLevel ) {
				expect( serializedBlock ).toContain( '{"headingLevel":' + headingLevel + '}' );
			} else {
				expect( serializedBlock ).not.toContain( '{"headingLevel":' + headingLevel + '}' );
			}
			expect( serializedBlock ).toMatchSnapshot();
		} );
	} );

	it( 'should render gutter classes', () => {
		[ 'none', 'small', 'medium', 'large', 'huge' ].forEach( gutterSize => {
			block.attributes.gutter = gutterSize;
			serializedBlock = serialize( block );
			expect( serializedBlock ).toBeDefined();
			expect( serializedBlock ).toContain( 'has-' + gutterSize + '-gutter' );
			expect( serializedBlock ).toMatchSnapshot();
		} );
	} );

	it( 'should render column classes', () => {
		[ 1, 2, 3, 4 ].forEach( columnSize => {
			block.attributes.columns = columnSize;
			serializedBlock = serialize( block );
			expect( serializedBlock ).toBeDefined();
			expect( serializedBlock ).toContain( 'has-' + columnSize + '-columns' );
			expect( serializedBlock ).toMatchSnapshot();
		} );
	} );

	it( 'should render padding classes', () => {
		[ 'none', 'small', 'medium', 'large', 'huge' ].forEach( paddingSize => {
			block.attributes.paddingSize = paddingSize;
			serializedBlock = serialize( block );
			expect( serializedBlock ).toBeDefined();
			expect( serializedBlock ).toContain( 'has-' + paddingSize + '-padding' );
			expect( serializedBlock ).toMatchSnapshot();
		} );
	} );

	it( 'should render margin classes', () => {
		[ 'none', 'small', 'medium', 'large', 'huge' ].forEach( marginSize => {
			block.attributes.marginSize = marginSize;
			serializedBlock = serialize( block );
			expect( serializedBlock ).toBeDefined();
			expect( serializedBlock ).toContain( 'has-' + marginSize + '-margin' );
			expect( serializedBlock ).toMatchSnapshot();
		} );
	} );
} );
