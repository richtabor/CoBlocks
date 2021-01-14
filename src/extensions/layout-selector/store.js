/* global coblocksLayoutSelector */
/**
 * External dependencies
 */
import { kebabCase } from 'lodash';

/**
 * WordPress dependencies
 */
import memoize from 'memize';
import { registerStore } from '@wordpress/data';
import { controls, select } from '@wordpress/data-controls';

const DEFAULT_STATE = {
	templateSelector: false,
	layouts: coblocksLayoutSelector.layouts || [],
	categories: coblocksLayoutSelector.categories || [],
	layoutUsage: {},
};

// Module constants
const MILLISECONDS_PER_HOUR = 3600 * 1000;
const MILLISECONDS_PER_DAY = 24 * 3600 * 1000;
const MILLISECONDS_PER_WEEK = 7 * 24 * 3600 * 1000;

// Taken from Core: https://github.com/WordPress/gutenberg/blob/e41e4f62074fac964d5c92e8836e826e90b289f7/packages/block-editor/src/store/selectors.js#L1434
const calculateFrequency = memoize( ( time, count ) => {
	if ( ! time ) {
		return count;
	}

	const duration = Date.now() - time;

	switch ( true ) {
		case duration < MILLISECONDS_PER_HOUR:
			return count * 4;
		case duration < MILLISECONDS_PER_DAY:
			return count * 2;
		case duration < MILLISECONDS_PER_WEEK:
			return count / 2;
		default:
			return count / 4;
	}
} );

const actions = {
	openTemplateSelector: () => ( { type: 'OPEN_TEMPLATE_SELECTOR' } ),
	closeTemplateSelector: () => ( { type: 'CLOSE_TEMPLATE_SELECTOR' } ),
	updateLayouts: ( layouts ) => ( { type: 'UPDATE_LAYOUTS', layouts } ),
	updateCategories: ( categories ) => ( { type: 'UPDATE_CATEGORIES', categories } ),
	incrementLayoutUsage: ( layout ) => ( { type: 'INCREMENT_LAYOUT_USAGE', layout, time: Date.now() } ),
};

const store = registerStore( 'coblocks/template-selector', {
	reducer( state = DEFAULT_STATE, action ) {
		switch ( action.type ) {
			case 'OPEN_TEMPLATE_SELECTOR':
				return {
					...state,
					templateSelector: true,
				};
			case 'CLOSE_TEMPLATE_SELECTOR':
				return {
					...state,
					templateSelector: false,
				};
			case 'UPDATE_LAYOUTS':
				return {
					...state,
					layouts: action.layouts,
				};
			case 'UPDATE_CATEGORIES':
				return {
					...state,
					categories: action.categories,
				};
			case 'INCREMENT_LAYOUT_USAGE':
				const layoutSlug = kebabCase( action.layout.label );
				return {
					...state,
					layoutUsage: {
						...state.layoutUsage,
						[ layoutSlug ]: {
							time: action.time,
							count: state.layoutUsage[ layoutSlug ]
								? state.layoutUsage[ layoutSlug ].count + 1
								: 1,
						},
					},
				};
		}

		return state;
	},

	actions,

	selectors: {
		isTemplateSelectorActive: ( state ) => state.templateSelector,
		hasLayouts: ( state ) => !! state.layouts.length,
		getLayouts: ( state ) => {
			const layouts = state.layouts || [];

			return layouts.map( ( layout ) => {
				const { time, count = 0 } = state.layoutUsage[ kebabCase( layout.label ) ] || {};
				return {
					...layout,
					frequency: calculateFrequency( time, count ),
				};
			} );
		},
		getCategories: ( state ) => state.categories || [],
		hasCategories: ( state ) => !! state.categories.length,
		getLayoutUsage: ( state ) => state.layoutUsage,
	},

	controls,

	resolvers: {
		* isTemplateSelectorActive() {
			const getCurrentPostAttributeStatus = yield select( 'core/editor', 'getCurrentPostAttribute', 'status' );
			const hasEditorUndo = yield select( 'core/editor', 'hasEditorUndo' );
			const isCurrentPostPublished = yield select( 'core/editor', 'isCurrentPostPublished' );

			const isDraft = getCurrentPostAttributeStatus.includes( 'draft' );
			const isCleanUnpublishedPost = ! isCurrentPostPublished && ! hasEditorUndo && isDraft;

			return isCleanUnpublishedPost && actions.openTemplateSelector();
		},
	},

	persist: [ 'layoutUsage' ],
} );

export default store;
