( function( $ ) {
	'use strict';

	var images = $( '.expandable-image ul li figure img' );
	var index;

	var wrapper = $( '<div/>', { class: 'masonry-modal-wrapper' } );
	var wrapperBackground = $( '<div/>', { class: 'wrapper-background' } );
	var modalHeading = $('<div/>', { class: 'modal-heading' });
	var close = $( '<div/>', { class: 'close' } );
	var counter = $( '<div/>', { class: 'counter' } );
	var imageContainer = $( '<div/>', { class: 'image-container' } );
	var image = $( '<img/>' );
	var arrowLeftContainer = $( '<div/>', { class: 'arrow-left-container' } );
	var arrowRightContainer = $( '<div/>', { class: 'arrow-right-container' } );
	var arrowRight = $( '<div/>', { class: 'arrow-right' } );
	var arrowLeft = $( '<div/>', { class: 'arrow-left' } );

	modalHeading.append( counter, close );
	imageContainer.append( image );
	arrowLeftContainer.append( arrowLeft );
	arrowRightContainer.append( arrowRight );
	wrapper.append( wrapperBackground, modalHeading, imageContainer, arrowLeftContainer, arrowRightContainer );
	$('body').prepend(wrapper);

	$( '.expandable-image ul li figure img' ).click( function( e ) {
		console.log(e);
		index = Number( e.target.attributes[ 5 ].value );
		wrapper.css( 'display', 'flex' );
		wrapperBackground.css( 'background', 'url(' + e.target.attributes[ 4 ].value + ')' );
		image.attr( 'src', e.target.attributes[ 4 ].value );
		counter.html( ( Number( e.target.attributes[ 5 ].value ) + 1 ) + ' / ' + images.length );
	} );

	$( '.arrow-left-container' ).click( function() {

		index === 0 ? index = 0 : index--;

		changeImage(index);
	});

	$( '.arrow-right-container' ).click( function() {

		index === images.length ? index = images.length : index++;

		changeImage(index);
	});

	wrapperBackground.click( function() {
		wrapper.css( 'display', 'none' );
	});

	close.click( function() {
		wrapper.css( 'display', 'none' );
	});

	function changeImage(index) {
		$.each(images, function( i, img ) {
			if ( img.attributes[ 5 ].value == index ) {
				wrapperBackground.css( 'background', 'url(' + img.attributes[ 4 ].value + ')' );
				image.attr( 'src', img.attributes[ 4 ].value );
				counter.html( ( Number( img.attributes[ 5 ].value ) + 1 ) + ' / ' + images.length );
			}
		});
	}

}( jQuery ) );
