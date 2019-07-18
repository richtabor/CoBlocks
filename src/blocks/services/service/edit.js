/**
 * Internal dependencies
 */

/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
const { __, _x } = wp.i18n;
const { Component, Fragment } = wp.element;
const {
	AlignmentToolbar,
	BlockControls,
	InspectorControls,
	InnerBlocks,
	MediaPlaceholder,
	mediaUpload,
} = wp.blockEditor;
const {
	PanelBody,
	ToggleControl,
	DropZone,
	IconButton,
	Spinner,
} = wp.components;
const { dispatch, select } = wp.data;
const { isBlobURL } = wp.blob;

/**
 * Constants
 */
const ALLOWED_BLOCKS = [ 'core/heading', 'core/button' ];

class Edit extends Component {
	updateInnerAttributes = ( blockName, newAttributes ) => {
		const innerItems = select( 'core/editor' ).getBlocksByClientId(
			this.props.clientId
		)[ 0 ].innerBlocks;

		innerItems.map( item => {
			if ( item.name === blockName ) {
				dispatch( 'core/editor' ).updateBlockAttributes(
					item.clientId,
					newAttributes
				);
			}
		} );
	};

	manageInnerBlock = ( blockName, blockAttributes, show = true ) => {
		const innerItems = select( 'core/editor' ).getBlocksByClientId(
			this.props.clientId
		)[ 0 ].innerBlocks;

		const targetBlock = innerItems.filter( item => item.name === blockName );

		if ( ! targetBlock.length && show ) {
			const newBlock = wp.blocks.createBlock( blockName, blockAttributes );
			dispatch( 'core/block-editor' ).insertBlocks(
				newBlock,
				innerItems.length,
				this.props.clientId,
				false
			);
		}

		if ( targetBlock.length && ! show ) {
			dispatch( 'core/block-editor' ).removeBlocks(
				targetBlock.map( item => item.clientId ),
				false
			);
		}
	};

	componentDidUpdate( prevProps ) {
		if (
			this.props.attributes.headingLevel !== prevProps.attributes.headingLevel
		) {
			this.updateInnerAttributes( 'core/heading', {
				level: this.props.attributes.headingLevel,
			} );
		}

		if ( this.props.attributes.alignment !== prevProps.attributes.alignment ) {
			this.updateInnerAttributes( 'core/heading', {
				align: this.props.attributes.alignment,
			} );
			this.updateInnerAttributes( 'core/paragraph', {
				align: this.props.attributes.alignment,
			} );
			this.updateInnerAttributes( 'core/button', {
				align: this.props.attributes.alignment,
			} );
		}

		if ( this.props.attributes.showCta !== prevProps.attributes.showCta ) {
			this.manageInnerBlock( 'core/button', {}, this.props.attributes.showCta );
		}
	}

	onChangeAlignment = alignment => {
		const { setAttributes } = this.props;

		setAttributes( { alignment } );
		this.updateInnerAttributes( 'core/heading', {
			align: this.props.attributes.alignment,
		} );
		this.updateInnerAttributes( 'core/paragraph', {
			align: this.props.attributes.alignment,
		} );
		this.updateInnerAttributes( 'core/button', {
			align: this.props.attributes.alignment,
		} );
	};

	toggleCta = () => {
		const { attributes, setAttributes } = this.props;

		const showCta = ! attributes.showCta;
		setAttributes( { showCta } );
		this.manageInnerBlock( 'core/button', {}, showCta );
	};

	replaceImage = files => {
		mediaUpload( {
			allowedTypes: [ 'image' ],
			filesList: files,
			onFileChange: ( [ media ] ) =>
				this.props.setAttributes( { imageUrl: media.url, imageAlt: media.alt } ),
		} );
	};

	renderImage() {
		const { attributes, setAttributes, isSelected } = this.props;

		const classes = classnames( 'wp-block-coblocks-service__figure', {
			'is-transient': isBlobURL( attributes.imageUrl ),
			'is-selected': isSelected,
		} );

		const dropZone = (
			<DropZone
				onFilesDrop={ this.replaceImage }
				label={ __( 'Drop image to replace' ) }
			/>
		);

		return (
			<Fragment>
				<figure className={ classes }>
					{ isSelected && (
						<div className="wp-block-coblocks-service__remove-menu">
							<IconButton
								icon="no-alt"
								onClick={ () => setAttributes( { imageUrl: '' } ) }
								className="coblocks-gallery-item__button"
								label={ __( 'Remove Image' ) }
								disabled={ ! isSelected }
							/>
						</div>
					) }
					{ dropZone }
					{ isBlobURL( attributes.imageUrl ) && <Spinner /> }
					<img src={ attributes.imageUrl } alt={ attributes.imageAlt } />
				</figure>
			</Fragment>
		);
	}

	renderPlaceholder() {
		const { setAttributes } = this.props;
		return (
			<MediaPlaceholder
				allowedTypes={ [ 'image' ] }
				multiple={ false }
				icon="format-image"
				labels={ {
					title: ' ',
				} }
				onSelect={ el => setAttributes( { imageUrl: el.url, imageAlt: el.alt } ) }
			/>
		);
	}

	render() {
		const { className, attributes } = this.props;

		const TEMPLATE = [
			[
				'core/heading',
				{
					placeholder: _x( 'Write title...', 'content placeholder' ),
					level: attributes.headingLevel,
				},
			],
			[
				'core/paragraph',
				{ placeholder: _x( 'Write description...', 'content placeholder' ) },
			],
		];

		if ( attributes.showCta ) {
			TEMPLATE.push( [ 'core/button', {} ] );
		}

		return (
			<Fragment>
				<BlockControls>
					<AlignmentToolbar
						value={ attributes.alignment }
						onChange={ this.onChangeAlignment }
					/>
				</BlockControls>
				<InspectorControls>
					<PanelBody title={ __( 'Group Settings' ) }>
						<ToggleControl
							label={ __( 'Action Buttons' ) }
							help={
								attributes.showCta ?
									__( 'Showing the call to action buttons.' ) :
									__( 'Toggle to show call to action buttons.' )
							}
							checked={ attributes.showCta }
							onChange={ this.toggleCta }
						/>
					</PanelBody>
				</InspectorControls>

				<div className={ className }>
					{ attributes.imageUrl ? this.renderImage() : this.renderPlaceholder() }
					<div className="wp-block-coblocks-service__content">
						<InnerBlocks
							allowedBlocks={ ALLOWED_BLOCKS }
							template={ TEMPLATE }
							templateLock={ false }
							templateInsertUpdatesSelection={ false }
						/>
					</div>
				</div>
			</Fragment>
		);
	}
}

export default Edit;
