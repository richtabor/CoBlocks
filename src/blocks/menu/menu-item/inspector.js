/**
 * WordPress dependencies.
 */
const { __ } = wp.i18n;
const { Fragment } = wp.element;
const { PanelBody, ToggleControl, CheckboxControl } = wp.components;
const { InspectorControls, BlockIcon } = wp.blockEditor;

const Inspector = props => {

	const {
		attributes,
		setAttributes,
		setSpicyTo,
		setHotTo,
	} = props;

	return (
		<InspectorControls>
			<PanelBody title={ __( 'Item Settings' ) } initialOpen={ true }>
				<ToggleControl
					label={ __( 'Image' ) }
					help={
						attributes.showImage ?
							__( 'Showing an image for this item.' ) :
							__( 'Toggle to show an image for this item.' )
					}
					checked={ attributes.showImage }
					onChange={ () => setAttributes( { showImage: ! attributes.showImage } ) }
				/>
				<ToggleControl
					label={ __( 'Price' ) }
					help={
						attributes.showPrice ?
							__( 'Showing the price for this item.' ) :
							__( 'Toggle to show the price for this item.' )
					}
					checked={ attributes.showPrice }
					onChange={ () => setAttributes( { showPrice: ! attributes.showPrice } ) }
				/>
				<div className='components-menu-item-attributes'>
					<p className='components-menu-item-attributes__label'>
						{ __( 'Item Attributes' ) }
					</p>
					<CheckboxControl
						label={ __( 'Gluten Free' ) }
						checked={ attributes.glutenFree }
						onChange={ () => setAttributes( { glutenFree: ! attributes.glutenFree } ) }
					/>
					<CheckboxControl
						label={ __( 'Pescatarian' ) }
						checked={ attributes.pescatarian }
						onChange={ () => setAttributes( { pescatarian: ! attributes.pescatarian } ) }
					/>
					<CheckboxControl
						label={ __( 'Spicy' ) }
						checked={ attributes.spicy }
						onChange={ setSpicyTo }
					/>
					<CheckboxControl
						label={ __( 'Spicier' ) }
						checked={ attributes.spicier }
						onChange={ setHotTo }
					/>
					<CheckboxControl
						label={ __( 'Vegan' ) }
						checked={ attributes.vegan }
						onChange={ () => setAttributes( { vegan: ! attributes.vegan } ) }
					/>
					<CheckboxControl
						label={ __( 'Vegetarian' ) }
						checked={ attributes.vegetarian }
						onChange={ () => setAttributes( { vegetarian: ! attributes.vegetarian } ) }
					/>
				</div>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
