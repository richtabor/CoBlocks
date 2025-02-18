/**
 * External dependencies
 */
import classnames from 'classnames';
import includes from 'lodash/includes';
import { find, isUndefined, pickBy, some, get, isEqual } from 'lodash';
import { PostsIcon as icon } from '@godaddy-wordpress/coblocks-icons';

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { compose, usePrevious } from '@wordpress/compose';
import { lazy, RawHTML, useState, useEffect, useRef } from '@wordpress/element';
import { escapeHTML } from '@wordpress/escape-html';
import { addQueryArgs } from '@wordpress/url';
import { dateI18n, format, getSettings } from '@wordpress/date';
import { withSelect } from '@wordpress/data';
import { BlockControls, RichText } from '@wordpress/block-editor';
import {
	Button,
	Disabled,
	Icon,
	Placeholder,
	QueryControls,
	Spinner,
	TextControl,
	Toolbar,
} from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import GutterWrapper from '../../components/gutter-control/gutter-wrapper';
import { pullLeft, pullRight, edit } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import icons from './icons';
import InspectorLoader from '../../components/inspector-loader';
const Inspector = lazy( () => import( './inspector' ) );

/**
 * Module Constants
 */
const CATEGORIES_LIST_QUERY = {
	per_page: -1,
};

const TokenList = wp.tokenList;

const styleOptions = [
	{
		name: 'stacked',
		/* translators: block style */
		label: __( 'Stacked', 'coblocks' ),
		icon: icons.styleStacked,
		isDefault: true,
	},
	{
		name: 'horizontal',
		/* translators: block style */
		label: __( 'Horizontal', 'coblocks' ),
		icon: icons.styleHorizontalImageRight,
		iconAlt: icons.styleHorizontalImageLeft,
	},
];

/**
 * Returns the active style from the given className.
 *
 * @param {Array}  styles    Block style variations.
 * @param {string} className Class name
 * @return {Object?} The active style.
 */
function getActiveStyle( styles, className ) {
	for ( const style of new TokenList( className ).values() ) {
		if ( style.indexOf( 'is-style-' ) === -1 ) {
			continue;
		}

		const potentialStyleName = style.substring( 9 );
		const activeStyle = find( styles, { name: potentialStyleName } );

		if ( activeStyle ) {
			return activeStyle;
		}
	}

	return find( styles, 'isDefault' );
}

/**
 * Replaces the active style in the block's className.
 *
 * @param {string}  className   Class name.
 * @param {Object?} activeStyle The replaced style.
 * @param {Object}  newStyle    The replacing style.
 * @return {string} The updated className.
 */
function replaceActiveStyle( className, activeStyle, newStyle ) {
	const list = new TokenList( className );

	if ( activeStyle ) {
		list.remove( 'is-style-' + activeStyle.name );
	}

	list.add( 'is-style-' + newStyle.name );

	return list.value;
}

const PostsEdit = ( props ) => {
	const {
		attributes,
		setAttributes,
		className,
		latestPosts,
	} = props;

	const {
		displayPostContent,
		displayPostDate,
		displayPostLink,
		postLink,
		postFeedType,
		externalRssUrl,
		columns,
		postsToShow,
		excerptLength,
		listPosition,
		imageSize,
		imageStyle,
	} = attributes;

	const [ categoriesList, setCategoriesList ] = useState( [] );
	const [ editing, setEditing ] = useState( externalRssUrl );
	const [ stackedDefaultColumns ] = useState( 2 );
	const [ horizontalDefaultColumns ] = useState( 1 );
	const [ userModifiedColumn, setUserModifiedColumn ] = useState(
		( className.includes( 'is-style-stacked' ) && columns !== stackedDefaultColumns ) ||
		( className.includes( 'is-style-horizontal' ) && columns !== horizontalDefaultColumns ) ? true : false
	);

	const prevClassname = usePrevious( className );

	let isStillMounted = useRef( true );

	const activeStyle = getActiveStyle( styleOptions, className );

	useEffect( () => {
		updateStyle( activeStyle );

		apiFetch( {
			path: addQueryArgs( '/wp/v2/categories', CATEGORIES_LIST_QUERY ),
		} ).then(
			( newCategoriesList ) => {
				if ( isStillMounted ) {
					setCategoriesList( newCategoriesList );
				}
			}
		).catch(
			() => {
				if ( isStillMounted ) {
					setCategoriesList( [] );
				}
			}
		);

		return () => {
			isStillMounted = false;
		};
	}, [] );

	useEffect( () => {
		if ( displayPostLink && ! displayPostContent ) {
			setAttributes( {
				displayPostLink: false,
			} );
		}

		if ( className !== prevClassname ) {
			if ( className.includes( 'is-style-stacked' ) ) {
				setAttributes( { columns: userModifiedColumn ? columns : stackedDefaultColumns } );
			}

			if ( className.includes( 'is-style-horizontal' ) ) {
				setAttributes( { columns: userModifiedColumn ? columns : horizontalDefaultColumns } );
			}
		}
	}, [
		prevClassname,
		className,
		userModifiedColumn,
		columns,
		stackedDefaultColumns,
		horizontalDefaultColumns,
	] );

	const editToolbarControls = [
		{
			icon: edit,
			title: __( 'Edit RSS URL', 'coblocks' ),
			onClick: () => setEditing( true ),
		},
	];

	const hasPosts = Array.isArray( latestPosts ) && latestPosts.length;

	const displayPosts = Array.isArray( latestPosts ) && latestPosts.length > postsToShow ? latestPosts.slice( 0, postsToShow ) : latestPosts;

	const hasFeaturedImage = some( displayPosts, 'featured_media_object' );

	const toolbarControls = [ {
		icon: <Icon icon={ pullLeft } />,
		title: __( 'Image on left', 'coblocks' ),
		isActive: listPosition === 'left',
		onClick: () => setAttributes( { listPosition: 'left' } ),
	}, {
		icon: <Icon icon={ pullRight } />,
		title: __( 'Image on right', 'coblocks' ),
		isActive: listPosition === 'right',
		onClick: () => setAttributes( { listPosition: 'right' } ),
	} ];

	const dateFormat = getSettings().formats.date;

	const updateStyle = ( style ) => {
		const newActiveStyle = getActiveStyle( styleOptions, className );
		const updatedClassName = replaceActiveStyle(
			attributes.className,
			newActiveStyle,
			style
		);

		setAttributes( { className: updatedClassName } );
	};

	const onUserModifiedColumn = () => {
		setUserModifiedColumn( true );
	};

	const onSubmitURL = ( event ) => {
		event.preventDefault();

		if ( externalRssUrl ) {
			setEditing( false );
		}
	};

	if ( ! hasPosts && postFeedType === 'internal' ) {
		return (
			<>
				<InspectorLoader>
					<Inspector
						{ ...props }
						attributes={ attributes }
						hasPosts={ hasPosts }
						hasFeaturedImage={ hasFeaturedImage }
						editing={ editing }
						activeStyle={ activeStyle }
						styleOptions={ styleOptions }
						onUpdateStyle={ updateStyle }
						categoriesList={ categoriesList }
						postCount={ latestPosts && latestPosts.length }
					/>
				</InspectorLoader>
				<Placeholder
					icon={ <Icon icon={ icon } /> }
					label={ __( 'Blog Posts', 'coblocks' ) }
				>
					{ ! Array.isArray( latestPosts )
						? <Spinner />
						: <>
							{ __( 'No posts found. Start publishing or add posts from an RSS feed.', 'coblocks' ) }
							<Button
								className="components-placeholder__cancel-button"
								title={ __( 'Retrieve an External Feed', 'coblocks' ) }
								isSecondary
								onClick={ () => {
									setAttributes( { postFeedType: 'external' } );
								} }
							>
								{ __( 'Use External Feed', 'coblocks' ) }
							</Button>
						</>
					}
				</Placeholder>
			</>
		);
	}

	if ( editing && postFeedType === 'external' ) {
		return (
			<>
				<InspectorLoader>
					<Inspector
						{ ...props }
						onUserModifiedColumn={ onUserModifiedColumn }
						attributes={ attributes }
						hasPosts={ hasPosts }
						hasFeaturedImage={ false }
						editing={ editing }
						activeStyle={ activeStyle }
						styleOptions={ styleOptions }
						onUpdateStyle={ updateStyle }
						categoriesList={ categoriesList }
						postCount={ latestPosts && latestPosts.length }
					/>
				</InspectorLoader>
				<Placeholder
					icon={ <Icon icon={ icon } /> }
					label={ __( 'RSS Feed', 'coblocks' ) }
					instructions={ __( 'RSS URLs are generally located at the /feed/ directory of a site.', 'coblocks' ) }
				>
					<form onSubmit={ onSubmitURL }>
						<TextControl
							placeholder={ __( 'https://example.com/feed…', 'coblocks' ) }
							value={ externalRssUrl }
							onChange={ ( value ) => setAttributes( { externalRssUrl: value } ) }
							className={ 'components-placeholder__input' }
						/>
						<Button type="submit" disabled={ ! externalRssUrl }>
							{ __( 'Use URL', 'coblocks' ) }
						</Button>
					</form>
				</Placeholder>
			</>
		);
	}

	const isHorizontalStyle = includes( className, 'is-style-horizontal' );
	const isStackedStyle = includes( className, 'is-style-stacked' );

	return (
		<>
			<InspectorLoader>
				<Inspector
					{ ...props }
					onUserModifiedColumn={ onUserModifiedColumn }
					attributes={ attributes }
					hasPosts={ hasPosts }
					hasFeaturedImage={ hasFeaturedImage }
					editing={ editing }
					activeStyle={ activeStyle }
					styleOptions={ styleOptions }
					onUpdateStyle={ updateStyle }
					categoriesList={ categoriesList }
					postCount={ latestPosts && latestPosts.length }
				/>
			</InspectorLoader>
			<BlockControls>
				{ isHorizontalStyle &&
					<Toolbar
						controls={ toolbarControls }
					/>
				}
				{ postFeedType === 'external' &&
					<Toolbar
						controls={ editToolbarControls }
					/>
				}
			</BlockControls>
			{ postFeedType === 'external' &&
				<Disabled>
					<ServerSideRender
						block="coblocks/posts"
						attributes={ attributes }
					/>
				</Disabled>
			}
			{ postFeedType === 'internal' &&

				<div className={ className }>
					<GutterWrapper { ...attributes } condition={ attributes.columns >= 2 }>
						<div className={ classnames( 'wp-block-coblocks-posts__inner', {
							'has-columns': columns,
							[ `has-${ columns }-columns` ]: columns,
							'has-responsive-columns': columns,
							'has-image-right': isHorizontalStyle && listPosition === 'right',
							[ `has-${ imageSize }-image` ]: isHorizontalStyle,
							[ `has-${ imageStyle }-image` ]: imageStyle,
						} ) }>
							{ displayPosts.map( ( post, i ) => {
								const featuredImageUrl = post.featured_media_object ? post.featured_media_object.source_url : null;
								const featuredImageStyle = 'url(' + featuredImageUrl + ')';

								const contentClasses = classnames( 'wp-block-coblocks-posts__content', {
									'self-center': isHorizontalStyle && ! displayPostContent && columns <= 2,
								} );

								const titleTrimmed = post.title.rendered.trim();

								let excerpt = post.excerpt.rendered;
								if ( post.excerpt.raw === '' ) {
									excerpt = post.content.raw;
								}
								const excerptElement = document.createElement( 'div' );
								excerptElement.innerHTML = excerpt;
								excerpt = excerptElement.textContent || excerptElement.innerText || '';

								return (
									<div key={ i } className="wp-block-coblocks-posts__item">
										{ featuredImageUrl &&
											<div className="wp-block-coblocks-posts__image">
												<div className="bg-cover bg-center-center" style={ { backgroundImage: featuredImageStyle } }></div>
											</div>
										}
										<div className={ contentClasses }>
											{ isStackedStyle && displayPostDate && post.date_gmt &&
												<time dateTime={ format( 'c', post.date_gmt ) } className="wp-block-coblocks-posts__date">
													{ dateI18n( dateFormat, post.date_gmt ) }
												</time>
											}
											<Disabled>
												<a href={ post.link } target="_blank" rel="noreferrer noopener" alt={ titleTrimmed }>
													{ titleTrimmed ? (
														<RawHTML>
															{ titleTrimmed }
														</RawHTML>
													)
														/* translators: placeholder when a post has no title */
														: __( '(no title)', 'coblocks' )
													}
												</a>
											</Disabled>
											{ isHorizontalStyle && displayPostDate && post.date_gmt &&
												<time dateTime={ format( 'c', post.date_gmt ) } className="wp-block-coblocks-posts__date">
													{ dateI18n( dateFormat, post.date_gmt ) }
												</time>
											}
											{ displayPostContent &&
												<div className="wp-block-coblocks-posts__excerpt">
													<RawHTML
														key="html"
													>
														{ excerptLength < excerpt.trim().split( ' ' ).length
															? escapeHTML( excerpt.trim().split( ' ', excerptLength ).join( ' ' ) ) + '…'
															: escapeHTML( excerpt.trim().split( ' ', excerptLength ).join( ' ' ) ) }
													</RawHTML>
												</div>
											}
											{ displayPostLink &&
												<RichText
													tagName="a"
													className="wp-block-coblocks-posts__more-link"
													onChange={ ( newPostLink ) => setAttributes( { postLink: newPostLink } ) }
													value={ postLink }
													placeholder={ __( 'Read more', 'coblocks' ) }
													multiline={ false }
													withoutInteractiveFormatting={ false }
													isSelected={ false }
												/>
											}
										</div>
									</div>
								);
							} ) }
						</div>
					</GutterWrapper>
				</div>
			}
		</>
	);
};

export default compose( [
	withSelect( ( select, props ) => {
		const { postsToShow, order, orderBy, categories, categoryRelation } = props.attributes;
		const { getEntityRecords, getMedia } = select( 'core' );
		const { getCurrentPost } = select( 'core/editor' );

		const useUpdatedQueryControls = QueryControls.toString().includes( 'selectedCategories' );
		const currentPost = getCurrentPost();

		const deprecatedQuery = () => {
			const latestPostsQuery = pickBy( {
				categories,
				order,
				orderby: orderBy,
				per_page: postsToShow,
				exclude: currentPost.id,
			}, ( value ) => ! isUndefined( value ) );

			let latestPosts = getEntityRecords( 'postType', 'post', latestPostsQuery );
			if ( latestPosts ) {
				latestPosts = latestPosts.map( ( post ) => {
					return {
						...post,
						featured_media_object: post.featured_media && select( 'core' ).getMedia( post.featured_media ),
					};
				} );
			}
			return latestPosts;
		};

		const updatedQuery = () => {
			const catIds = categories && categories.length > 0
				? categories.map( ( cat ) => cat?.id )
				: [];

			const latestPostsQuery = pickBy( {
				categories: catIds,
				order,
				orderby: orderBy,
				per_page: 'and' === categoryRelation ? '-1' : postsToShow,
				exclude: currentPost.id,
			}, ( value ) => ! isUndefined( value ) );

			let latestPosts = getEntityRecords( 'postType', 'post', latestPostsQuery );

			if ( 'and' === categoryRelation && latestPosts ) {
				latestPosts = latestPosts.filter( ( post ) =>
					// `concat` to prevent mutation `sort` to ensure order is consistent.
					isEqual( post.categories.concat().sort(), catIds.concat().sort() ) )
					.slice( 0, postsToShow );
			}

			return ! Array.isArray( latestPosts )
				? latestPosts
				: latestPosts.map( ( post ) => {
					if ( post.featured_media ) {
						const image = getMedia( post.featured_media );
						let url = get(
							image,
							[
								'media_details',
								'sizes',
								'source_url',
							],
							null
						);
						if ( ! url ) {
							url = get( image, 'source_url', null );
						}
						return {
							...post,
							featured_media_object: post.featured_media && select( 'core' ).getMedia( post.featured_media ),
						};
					}
					return post;
				} );
		};

		return {
			latestPosts: useUpdatedQueryControls ? updatedQuery() : deprecatedQuery(),
			useUpdatedQueryControls,
		};
	} ),
] )( PostsEdit );
