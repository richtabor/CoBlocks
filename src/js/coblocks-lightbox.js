/*global coblocksLightboxData */
( function( ) {
	'use strict';

	const { closeLabel, leftLabel, rightLabel } = coblocksLightboxData;
	const lightboxModals = document.getElementsByClassName( 'has-lightbox' );

	Array.from( lightboxModals ).forEach( function( lightbox, index ) {
		lightbox.className += ' lightbox-' + index + ' ';
		renderLightboxModal( index );
	} );

	function renderLightboxModal( lightboxIndex ) {
		const wrapper = document.createElement( 'div' );
		wrapper.setAttribute( 'class', 'coblocks-lightbox' );

		const wrapperBackground = document.createElement( 'div' );
		wrapperBackground.setAttribute( 'class', 'coblocks-lightbox__background' );

		const modalHeading = document.createElement( 'div' );
		modalHeading.setAttribute( 'class', 'coblocks-lightbox__heading' );

		const close = document.createElement( 'button' );
		close.setAttribute( 'class', 'coblocks-lightbox__close' );
		close.setAttribute( 'aria-label', closeLabel );

		const counter = document.createElement( 'span' );
		counter.setAttribute( 'class', 'coblocks-lightbox__count' );

		const imageContainer = document.createElement( 'div' );
		imageContainer.setAttribute( 'class', 'coblocks-lightbox__image' );

		const image = document.createElement( 'img' );
		image.setAttribute( 'alt', 'Placeholder' );

		const caption = document.createElement( 'figcaption' );
		caption.setAttribute( 'class', 'coblocks-lightbox__caption' );

		const arrowLeftContainer = document.createElement( 'button' );
		arrowLeftContainer.setAttribute( 'class', 'coblocks-lightbox__arrow coblocks-lightbox__arrow--left' );
		arrowLeftContainer.setAttribute( 'aria-label', leftLabel );

		const arrowRightContainer = document.createElement( 'button' );
		arrowRightContainer.setAttribute( 'class', 'coblocks-lightbox__arrow coblocks-lightbox__arrow--right' );
		arrowRightContainer.setAttribute( 'aria-label', rightLabel );

		const arrowRight = document.createElement( 'div' );
		arrowRight.setAttribute( 'class', 'arrow-right' );
		arrowRight.setAttribute( 'aria-label', rightLabel );

		const arrowLeft = document.createElement( 'div' );
		arrowLeft.setAttribute( 'class', 'arrow-left' );
		arrowLeft.setAttribute( 'aria-label', leftLabel );

		const imageSelector = [
			`.has-lightbox.lightbox-${ lightboxIndex } > :not(.carousel-nav) figure img`,
			`.has-lightbox.lightbox-${ lightboxIndex } > figure img`,
			`figure.has-lightbox.lightbox-${ lightboxIndex } > img`,
			`.has-lightbox.lightbox-${ lightboxIndex } > figure[class^="align"] img`,
			`.masonry-grid.has-lightbox.lightbox-${ lightboxIndex } figure img`,
		].join( ', ' );

		const captionSelector = [
			`.has-lightbox.lightbox-${ lightboxIndex } > :not(.carousel-nav) figure figcaption`,
			`.masonry-grid.has-lightbox.lightbox-${ lightboxIndex } figure figcaption`,
		].join( ', ' );

		const images = document.querySelectorAll( imageSelector );
		const captions = document.querySelectorAll( captionSelector );
		let index;

		modalHeading.append( counter, close );

		imageContainer.append( image, caption );
		arrowLeftContainer.append( arrowLeft );
		arrowRightContainer.append( arrowRight );

		wrapper.append( wrapperBackground, modalHeading, imageContainer, arrowLeftContainer, arrowRightContainer );

		if ( images.length > 0 ) {
			document.getElementsByTagName( 'BODY' )[ 0 ].append( wrapper );
			if ( images.length === 1 ) {
				arrowRightContainer.remove();
				arrowLeftContainer.remove();
			}
		}

		if ( captions.length > 0 ) {
			Array.from( captions ).forEach( function( captionElem, captionIndex ) {
				captionElem.addEventListener( 'click', function() {
					changeImage( captionIndex );
				} );
			} );
		}

		Array.from( images ).forEach( function( img, imgIndex ) {
			img.closest( 'figure' ).addEventListener( 'click', function() {
				changeImage( imgIndex );
			} );
		} );

		arrowLeftContainer.addEventListener( 'click', function() {
			index = ( index === 0 ) ? ( images.length - 1 ) : ( index - 1 );
			changeImage( index );
		} );

		arrowRightContainer.addEventListener( 'click', function() {
			index = ( index === ( images.length - 1 ) ) ? 0 : ( index + 1 );
			changeImage( index );
		} );

		wrapperBackground.addEventListener( 'click', function() {
			wrapper.style.display = 'none';
		} );

		close.addEventListener( 'click', function() {
			removeKeyboardListener();
			wrapper.style.display = 'none';
		} );

		function getImageCaption( elem ) {
			const selector = 'figcaption';
			let sibling = elem.nextElementSibling;

			// If the sibling matches our selector, use it
			// If not, jump to the next sibling and continue the loop
			while ( sibling ) {
				if ( sibling.matches( selector ) ) {
					return sibling.innerHTML;
				}
				sibling = sibling.nextElementSibling;
			}
			return '';
		}

		const imagePreloader = {
			preloaded: false,
			setPreloadImages: () => {
				if ( ! imagePreloader.preloaded ) {
					imagePreloader.preloaded = true;
					Array.from( images ).forEach( function( img, imgIndex ) {
						imagePreloader[ `img-${ imgIndex }` ] = new window.Image();

						// If the src is lazy loaded, use the data-src attribute.
						// Compatibility with A3 Lazy Load plugin and maybe others.
						if (
							img.attributes.src.value?.includes( 'lazy-load' ) &&
							'undefined' !== typeof img.attributes?.[ 'data-src' ]?.value
						) {
							imagePreloader[ `img-${ imgIndex }` ].src =
								img.attributes[ 'data-src' ].value;
						} else {
							imagePreloader[ `img-${ imgIndex }` ].src =
								img.attributes.src.value;
						}

						imagePreloader[ `img-${ imgIndex }` ].alt = img.attributes.alt?.value || '';

						imagePreloader[ `img-${ imgIndex }` ][ 'data-caption' ] =
								( images[ imgIndex ] && images[ imgIndex ].nextElementSibling )
									? getImageCaption( images[ imgIndex ] ) : '';
					} );
				}
			},
		};

		function openLightbox() {
			// Initial display value of wrapper is ''. If display !== 'flex' should simplify the logic here.
			const isClosed = wrapper.style.display !== 'flex';
			if ( isClosed ) {
				wrapper.style.display = 'flex';
				setKeyboardListener();
			}
		}

		function changeImage( imageIndex ) {
			imagePreloader.setPreloadImages();
			index = imageIndex;
			openLightbox();
			wrapperBackground.style.backgroundImage = `url(${ imagePreloader[ `img-${ index }` ].src })`;
			image.src = imagePreloader[ `img-${ index }` ].src;
			image.alt = imagePreloader[ `img-${ index }` ].alt;
			caption.innerHTML = imagePreloader[ `img-${ index }` ][ 'data-caption' ];
			counter.textContent = `${ ( index + 1 ) } / ${ images.length }`;
		}

		const setKeyboardListener = () => document.addEventListener( 'keydown', keyPressEventListener );
		const removeKeyboardListener = () => document.removeEventListener( 'keydown', keyPressEventListener );

		const keyPressEventListener = ( event ) => {
			if ( ! event || ! event?.code ) {
				return;
			}

			const lightboxIsOpen = wrapper.style.display === 'flex';

			if ( lightboxIsOpen ) {
				const code = event.code;
				switch ( code ) {
					case 'Escape' : // Esc key
						close.click();
						break;
					case 'ArrowLeft' : // Arrow left.
						arrowLeftContainer.click();
						break;
					case 'KeyA' : // 'A' key.
						arrowLeftContainer.click();
						break;
					case 'ArrowRight' : // Arrow right.
						arrowRightContainer.click();
						break;
					case 'KeyD' : // 'D' key.
						arrowRightContainer.click();
						break;
				}
			}
		};
	}
}() );
