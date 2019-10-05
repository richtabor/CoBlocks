/**
 * External dependencies
 */
import classnames from 'classnames';
import includes from 'lodash/includes';
import { find, isUndefined, pickBy } from 'lodash';
import Slider from 'react-slick';

/**
 * Internal dependencies
 */

import InspectorControls from './inspector';
import blogIcons from './icons';

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { __, _x } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { Component, RawHTML, Fragment } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
import { dateI18n, format, __experimentalGetSettings } from '@wordpress/date';
import { withSelect } from '@wordpress/data';
import { BlockControls, PlainText, RichText } from '@wordpress/block-editor';
import {
	Placeholder,
	Spinner,
	Toolbar,
	TextControl,
	Button,
	ServerSideRender,
} from '@wordpress/components';

/**
 * Module Constants
 */
const CATEGORIES_LIST_QUERY = {
	per_page: -1,
};

const TokenList = wp.tokenList;

const styleOptions = [
	{
		name: 'list',
		label: __( 'List' ),
		icon: blogIcons.layoutListIcon,
		isDefault: true,
	},
	{
		name: 'grid',
		label: __( 'Grid' ),
		icon: blogIcons.layoutGridIcon,
	},
	{
		name: 'carousel',
		label: __( 'Carousel' ),
		icon: blogIcons.layoutCarouselIcon,
	},
];

/**
 * Returns the active style from the given className.
 *
 * @param {Array} styles Block style variations.
 * @param {string} className  Class name
 *
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
 *
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

class BlogrollEdit extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			categoriesList: [],
			editing: ! this.props.attributes.externalRssUrl,
		};

		this.onSubmitURL = this.onSubmitURL.bind( this );
	}

	componentDidMount() {
		const { className } = this.props;
		const activeStyle = getActiveStyle( styleOptions, className );

		this.updateStyle( activeStyle );

		this.isStillMounted = true;
		this.fetchRequest = apiFetch( {
			path: addQueryArgs( '/wp-json/wp/v2/categories', CATEGORIES_LIST_QUERY ),
		} ).then(
			( categoriesList ) => {
				if ( this.isStillMounted ) {
					this.setState( { categoriesList } );
				}
			}
		).catch(
			() => {
				if ( this.isStillMounted ) {
					this.setState( { categoriesList: [] } );
				}
			}
		);
	}

	componentWillUnmount() {
		this.isStillMounted = false;
	}

	componentDidUpdate() {
		const { displayPostContent, displayPostLink } = this.props.attributes;
		if ( displayPostLink && ! displayPostContent ) {
			this.props.setAttributes( {
				displayPostLink: false,
			} );
		}
	}

	onSubmitURL( event ) {
		event.preventDefault();

		const { externalRssUrl } = this.props.attributes;
		if ( externalRssUrl ) {
			this.setState( { editing: false } );
		}
	}

	updateStyle = style => {
		const { className, attributes, setAttributes } = this.props;

		const activeStyle = getActiveStyle( styleOptions, className );
		const updatedClassName = replaceActiveStyle(
			attributes.className,
			activeStyle,
			style
		);

		setAttributes( { className: updatedClassName } );
	};

	render() {
		const {
			attributes,
			setAttributes,
			className,
			latestPosts,
		} = this.props;

		const { categoriesList } = this.state;

		const isListStyle = includes( className, 'is-style-list' );
		const isGridStyle = includes( className, 'is-style-grid' );
		const isCarouselStyle = includes( className, 'is-style-carousel' );

		const activeStyle = getActiveStyle( styleOptions, className );

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
			infiniteSlide,
			prevNextButtons,
			visibleItems,
			draggable,
			autoPlay,
			autoPlaySpeed,
			imageSize,
		} = attributes;

		const imageClasses = classnames( 'wp-block-coblocks-blogroll__image', 'flex-0', imageSize, {
			'mr-6': isListStyle && listPosition === 'left',
			'ml-6': isListStyle && listPosition === 'right',
		} );

		const editToolbarControls = [
			{
				icon: 'edit',
				title: __( 'Edit RSS URL' ),
				onClick: () => this.setState( { editing: true } ),
			},
		];

		const hasPosts = Array.isArray( latestPosts ) && latestPosts.length;
		if ( ! hasPosts && postFeedType === 'internal' ) {
			return (
				<Fragment>
					<InspectorControls
						{ ...this.props }
						attributes={ attributes }
						hasPosts={ hasPosts }
						editing={ this.state.editing }
						activeStyle={ activeStyle }
						styleOptions={ styleOptions }
						onUpdateStyle={ this.updateStyle }
						categoriesList={ categoriesList }
					/>
					<Placeholder
						icon="admin-post"
						label={ __( 'Blog' ) }
					>
						{ ! Array.isArray( latestPosts ) ?
							<Spinner /> :
							__( 'No posts found.' )
						}
					</Placeholder>
				</Fragment>
			);
		}

		const displayPosts = Array.isArray( latestPosts ) && latestPosts.length > postsToShow ?
			latestPosts.slice( 0, postsToShow ) :
			latestPosts;

		const toolbarControls = [ {
			icon: blogIcons.listPositionLeft,
			title: __( 'Image on left' ),
			isActive: listPosition === 'left',
			onClick: () => setAttributes( { listPosition: 'left' } ),
		}, {
			icon: blogIcons.listPositionRight,
			title: __( 'Image on right' ),
			isActive: listPosition === 'right',
			onClick: () => setAttributes( { listPosition: 'right' } ),
		} ];

		const slickSettings = {
			autoPlay: autoPlay,
			autoPlaySpeed: autoPlaySpeed,
			dots: false,
			arrows: prevNextButtons,
			infinite: infiniteSlide,
			draggable: draggable,
			adaptiveHeight: false,
			speed: 500,
			slidesToShow: visibleItems,
			slidesToScroll: 1,
		};

		const dateFormat = __experimentalGetSettings().formats.date; // eslint-disable-line no-restricted-syntax

		if ( this.state.editing && postFeedType === 'external' ) {
			return (
				<Fragment>
					<InspectorControls
						{ ...this.props }
						attributes={ attributes }
						hasPosts={ hasPosts }
						editing={ this.state.editing }
						activeStyle={ activeStyle }
						styleOptions={ styleOptions }
						onUpdateStyle={ this.updateStyle }
						categoriesList={ categoriesList }
					/>
					<Placeholder
						icon="rss"
						label="RSS"
					>
						<form onSubmit={ this.onSubmitURL }>
							<TextControl
								placeholder={ __( 'Enter URL here…' ) }
								value={ externalRssUrl }
								onChange={ ( value ) => setAttributes( { externalRssUrl: value } ) }
								className={ 'components-placeholder__input' }
							/>
							<Button isLarge type="submit">
								{ __( 'Use URL' ) }
							</Button>
						</form>
					</Placeholder>
				</Fragment>
			);
		}

		return (
			<div>
				<InspectorControls
					{ ...this.props }
					attributes={ attributes }
					hasPosts={ hasPosts }
					editing={ this.state.editing }
					activeStyle={ activeStyle }
					styleOptions={ styleOptions }
					onUpdateStyle={ this.updateStyle }
					categoriesList={ categoriesList }
				/>
				<BlockControls>
					{ isListStyle &&
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
					<ServerSideRender
						block="coblocks/blogroll"
						attributes={ this.props.attributes }
						className="coblocks-slick"
					/>
				}
				{ postFeedType === 'internal' && ! isCarouselStyle &&
				<ul
					className={ classnames( this.props.className, 'list-none', 'ml-0', 'pl-0', {
						[ `columns-${ columns }` ]: isGridStyle,
					} ) }
				>
					{ displayPosts.map( ( post, i ) => {
						const featuredImageUrl = post.featured_media_object ? post.featured_media_object.source_url : null;
						const featuredImageStyle = 'url(' + featuredImageUrl + ')';

						const listClasses = classnames( 'flex', 'flex-auto', 'items-stretch', 'w-full', 'mb-7', {
							'flex-row-reverse': listPosition === 'right',
							'has-featured-image': featuredImageUrl,
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
							<li key={ i } className={ listClasses }>
								{ featuredImageUrl &&
									<div className={ imageClasses }>
										<div className="block w-full h-full bg-cover bg-center-center pt-full" style={ { backgroundImage: featuredImageStyle } }></div>
									</div>
								}
								<div className="wp-block-coblocks-blogroll__content flex flex-col self-center w-full">
									{ displayPostDate && post.date_gmt &&
										<time dateTime={ format( 'c', post.date_gmt ) } className="wp-block-coblocks-blogroll__post-date">
											{ dateI18n( dateFormat, post.date_gmt ) }
										</time>
									}
									<a href={ post.link } target="_blank" rel="noreferrer noopener" alt={ titleTrimmed }>
										{ titleTrimmed ? (
											<RawHTML>
												{ titleTrimmed }
											</RawHTML>
										) :
											_x( '(no title)', 'placeholder when a post has no title' )
										}
									</a>
									{ displayPostContent &&
										<div className="wp-block-coblocks-blogroll__post-excerpt">
											<RawHTML
												key="html"
											>
												{ excerptLength < excerpt.trim().split( ' ' ).length ?
													excerpt.trim().split( ' ', excerptLength ).join( ' ' ) + '…' :
													excerpt.trim().split( ' ', excerptLength ).join( ' ' ) }
											</RawHTML>
										</div>
									}
									{ displayPostLink &&
										<RichText
											tagName="a"
											className="wp-block-coblocks-blogroll__more-link block self-start mt-3"
											onChange={ ( newPostLink ) => setAttributes( { postLink: newPostLink } ) }
											value={ postLink }
											placeholder={ __( 'Read more' ) }
											multiline={ false }
											withoutInteractiveFormatting={ false }
											isSelected={ false }
										/>
									}
								</div>
							</li>
						);
					} ) }
				</ul>
				}
				{ postFeedType === 'internal' && isCarouselStyle &&
					<Slider { ...slickSettings } className={ classnames( this.props.className ) }>
						{ displayPosts.map( ( post, i ) => {
							const featuredImageUrl = post.featured_media_object ? post.featured_media_object.source_url : null;
							const featuredImageStyle = 'url(' + featuredImageUrl + ')';
							const titleTrimmed = post.title.rendered.trim();
							let excerpt = post.excerpt.rendered;
							if ( post.excerpt.raw === '' ) {
								excerpt = post.content.raw;
							}
							const excerptElement = document.createElement( 'div' );
							excerptElement.innerHTML = excerpt;
							excerpt = excerptElement.textContent || excerptElement.innerText || '';
							return (
								<div className="coblocks-blog-post--item" key={ i }>
									<div className="coblocks-blog-post--item-inner">
										{ featuredImageUrl &&
											<div className="wp-block-coblocks-blogroll__image" style={ { backgroundImage: featuredImageStyle } }></div>
										}
										<div className={ classnames( 'wp-block-coblocks-blogroll__content', {
											'full-height': ! featuredImageUrl,
										} ) }>
											{ displayPostDate && post.date_gmt &&
												<time dateTime={ format( 'c', post.date_gmt ) } className="wp-block-coblocks-blogroll__post-date">
													{ dateI18n( dateFormat, post.date_gmt ) }
												</time>
											}
											<h5>
												{ titleTrimmed ? (
													<RawHTML>
														{ titleTrimmed }
													</RawHTML>
												) :
													__( '(Untitled)' )
												}
											</h5>
											{ displayPostContent &&
											<div className="wp-block-coblocks-blogroll__post-excerpt">
												<p>
													<RawHTML
														key="html"
													>
														{ excerpt.trim().split( ' ', excerptLength ).join( ' ' ) }
													</RawHTML>
												</p>
											</div>
											}
											{ displayPostLink &&
											<PlainText
												className="wp-block-coblocks-blogroll__more-link"
												onChange={ ( newPostLink ) => setAttributes( { postLink: newPostLink } ) }
												value={ postLink }
												placeholder={ __( 'Read more' ) }
											/>
											}
										</div>
									</div>
								</div>
							);
						} ) }
					</Slider>
				}
			</div>
		);
	}
}

export default compose( [
	withSelect( ( select, props ) => {
		const { postsToShow, order, orderBy, categories } = props.attributes;
		const { getEntityRecords } = select( 'core' );
		const latestPostsQuery = pickBy( {
			categories,
			order,
			orderby: orderBy,
			per_page: postsToShow,
		}, ( value ) => ! isUndefined( value ) );

		let latestPosts = getEntityRecords( 'postType', 'post', latestPostsQuery );
		if ( latestPosts ) {
			latestPosts = latestPosts.map( ( post ) => {
				return {
					...post,
					featured_media_object: select( 'core' ).getMedia( post.featured_media ),
				};
			} );
		}

		return {
			latestPosts: latestPosts,
		};
	} ),
] )( BlogrollEdit );
