/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import {
	Disabled,
} from '@wordpress/components';
import { PlainText } from '@wordpress/block-editor';
import { RawHTML } from '@wordpress/element';
import { escapeHTML } from '@wordpress/escape-html';
import { withSelect } from '@wordpress/data';
import { dateI18n, format, getSettings } from '@wordpress/date';

const PostItem = ( {
	post,
	setAttributes,
	attributes,
} ) => {
	const {
		excerptLength,
		displayPostLink,
		displayPostDate,
		displayPostContent,
		postLink,
	} = attributes;

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

	const dateFormat = getSettings().formats.date;

	return (
		<div className="wp-block-coblocks-post-carousel__item">
			{ featuredImageUrl &&
			<div className="wp-block-coblocks-post-carousel__image">
				<div className="bg-cover bg-center-center" style={ { backgroundImage: featuredImageStyle } }></div>
			</div>
			}
			<div className={ classnames( 'wp-block-coblocks-post-carousel__content', {
				'full-height': ! featuredImageUrl,
			} ) }>
				{ displayPostDate && post.date_gmt &&
				<time className="wp-block-coblocks-post-carousel__date" dateTime={ format( 'c', post.date_gmt ) }>
					{ dateI18n( dateFormat, post.date_gmt ) }
				</time>
				}
				<Disabled>
					<a alt={ titleTrimmed } href={ post.link } rel="noreferrer noopener" target="_blank">
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
				{ displayPostContent &&
				<div className="wp-block-coblocks-post-carousel__excerpt">
					<RawHTML
						key="html"
					>
						{ escapeHTML( excerpt.trim().split( ' ', excerptLength ).join( ' ' ) ) }
					</RawHTML>
				</div>
				}
				{ displayPostLink &&
				<PlainText
					className="wp-block-coblocks-post-carousel__more-link"
					onChange={ ( newPostLink ) => setAttributes( { postLink: newPostLink } ) }
					placeholder={ __( 'Read more', 'coblocks' ) }
					value={ postLink }
				/>
				}
			</div>
		</div>
	);
};

export default compose( [
	withSelect( ( select, { clientId } ) => {
		const blockAttributes = select( 'core/block-editor' ).getBlockAttributes( clientId );

		return {
			attributes: blockAttributes,
		};
	} ),
] )( PostItem );
