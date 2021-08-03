/* global coblocksBlockData */

/**
 * External dependencies
 */
import { OpentableIcon as icon } from '@godaddy-wordpress/coblocks-icons';

/**
 * Internal dependencies
 */
import Controls from './controls';
import OpenTable from './opentable';
import InspectorControls from './inspector';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { compose, usePrevious } from '@wordpress/compose';
import {
	Placeholder,
	Notice,
	Button,
	withNotices,
	Icon,
	FormTokenField,
} from '@wordpress/components';

const Edit = ( props ) => {
	const [ ridField, setRidField ] = useState( [] );
	const [ queryResults, setQueryResults ] = useState( [] );
	const { className, attributes } = props;
	const [ noResultsFound, setNoResultsFound ] = useState( false );

	const prevIDs = usePrevious( attributes.restaurantIDs );

	const getLocaleCode = () => {
		if ( typeof coblocksBlockData.localeCode !== 'undefined' ) {
			return coblocksBlockData.localeCode;
		}
		return '';
	};

	//searches the opentable reservation network for restaurants with the given name or ID
	const searchRestaurants = ( token ) => {
		fetch(
			'https://www.opentable.com/widget/reservation/restaurant-search?pageSize=15' +
				'&query=' +
				encodeURIComponent( token )
		)
			.then( ( response ) => response.json() )
			.then( ( json ) => {
				const results = [];
				for ( const item in json.items ) {
					const itemProps = json.items[ item ];
					const name = `${ decodeURIComponent( itemProps.name ) },  ${ decodeURIComponent( itemProps.addressResponse.city ) }, ${ decodeURIComponent( itemProps.addressResponse.country ) } (${ itemProps.rid })`;
					results.push( name );
				}
				setQueryResults( results );
				setNoResultsFound( !! results?.length === 0 );
			} );
	};
	useEffect( () => {
		if ( prevIDs !== attributes.restaurantIDs ) {
			setRidField( attributes.restaurantIDs );
		}
	}, [ attributes.restaurantIDs ] );

	useEffect( () => {
		if ( attributes.language === '' ) {
			switch ( getLocaleCode().substring( 0, coblocksBlockData.localeCode.indexOf( '_' ) ) ) {
				case 'fr':
					props.setAttributes( { language: 'fr-CA' } );
					break;
				case 'de':
					props.setAttributes( { language: 'de-DE' } );
					break;
				case 'es':
					props.setAttributes( { language: 'es-MX' } );
					break;
				case 'ja':
					props.setAttributes( { language: 'ja-JP' } );
					break;
				case 'nl':
					props.setAttributes( { language: 'nl-NL' } );
					break;
				case 'it':
					props.setAttributes( { language: 'it-IT' } );
					break;
				default:
					props.setAttributes( { language: 'en-US' } );
					break;
			}
		}
	}, [] );

	return (
		<>
			<Controls { ...props } />
			<InspectorControls
				className={ className }
				attributes={ attributes }
				setAttributes={ props.setAttributes }
			/>
			<div className={ className }>

				{ ( ! attributes.pinned ) ? (
					<Placeholder
						icon={ <Icon icon={ icon } /> }
						label={ __( 'OpenTable', 'coblocks' ) }
						instructions={ __(
							'Select your OpenTable restaurant(s) to show the reservations widget.',
							'coblocks'
						) }
						isColumnLayout={ true }
					>

						{ /* <form onSubmit={ renderOpenTable }> */ }
						<div className="components-placeholder__flex-fields">
							<FormTokenField
								value={ ridField || '' }
								suggestions={ queryResults }
								className="components-placeholder__input"
								placeholder={ __(
									'Select restaurant(s)',
									'coblocks'
								) }
								maxSuggestions={ 15 }
								onChange={ ( newRestaurantIDs ) => {
									setRidField( newRestaurantIDs );
								} }
								onInputChange={ ( token ) => {
									searchRestaurants( token );
								} }
								__experimentalHowTo={ false }
								tokenizeOnSpace={ false }
							/>
							<Button
								isPrimary={ !! ridField }
								isSecondary={ ! ridField }
								type="submit"
								disabled={ ridField.length < 1 }
								onClick={ () => {
									const parsedRestaurants = [];
									for ( const restaurant in ridField ) {
										const r = ridField[ restaurant ];
										parsedRestaurants.push( r.substring( r.lastIndexOf( '(' ) + 1, r.length - 1 ) );
									}
									props.setAttributes( { restaurantIDs: parsedRestaurants, pinned: true } );
								} }
							>
								{ __( 'Embed', 'coblocks' ) }
							</Button>
						</div>
						{ /* </form> */ }
						{ noResultsFound && <Notice isDismissible={ false }>No results found.</Notice> }
						<div></div>
						<div className="components-placeholder__opentable-help-links">
							<a target="_blank" rel="noopener noreferrer" href="https://restaurant.opentable.com/get-started/">{ __( 'Sign up for OpenTable', 'coblocks' ) }</a>
						</div>

					</Placeholder>
				)
					: <>
						<div
							style={ { width: '100%', height: '100%', position: 'absolute' } }
						/>
						<OpenTable { ...props } />
					</>
				}
			</div>
		</>
	);
};

export default compose( [ withNotices ] )( Edit );
