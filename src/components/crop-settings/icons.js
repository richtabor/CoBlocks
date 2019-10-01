/**
 * WordPress dependencies
 */
const { SVG, Path, Rect, G } = wp.components;

/**
 * Block user interface icons
 */
const icons = {};

icons.rotateLeft = (
	<SVG height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><G fillRule="nonzero"><Path d="m16.6083333 6.05c-1.4583333-1.46666667-3.3833333-2.2-5.3-2.2v-2.7l-3.5333333 3.53333333 3.5333333 3.53333334v-2.7c1.4916667 0 2.9833334.56666666 4.125 1.70833333 2.275 2.275 2.275 5.975 0 8.25-1.1416666 1.1416667-2.6333333 1.7083333-4.125 1.7083333-.8083333 0-1.61666663-.175-2.36666663-.5083333l-1.24166667 1.2416667c1.125.6166666 2.3666667.9333333 3.6083333.9333333 1.9166667 0 3.8416667-.7333333 5.3-2.2 2.9333334-2.925 2.9333334-7.675 0-10.6z" /><Rect height="7.629365" rx="1" transform="matrix(.70710678 .70710678 -.70710678 .70710678 9.898365 -1.366222)" width="7.651147" x="2.772785" y="7.450591" /></G></SVG>
);

icons.rotateRight = (
	<SVG height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><Path d="m16.3991194 6.05c2.9333333 2.925 2.9333333 7.675 0 10.6-1.4583334 1.4666667-3.3833334 2.2-5.3 2.2-1.2416667 0-2.48333337-.3166667-3.60833337-.9333333l1.24166667-1.2416667c.75.3333333 1.5583333.5083333 2.3666667.5083333 1.4916666 0 2.9833333-.5666666 4.125-1.7083333 2.275-2.275 2.275-5.975 0-8.25-1.1416667-1.14166667-2.6333334-1.70833333-4.125-1.70833333v2.7l-3.53333337-3.53333334 3.53333337-3.53333333v2.7c1.9166666 0 3.8416666.73333333 5.3 2.2zm-9.31056951.51990318 3.99596431 3.99596432c.3905243.3905242.3905243 1.0236892 0 1.4142135l-3.98056251 3.9805625c-.39052429.3905243-1.02368927.3905243-1.41421356 0l-3.99596427-3.9959643c-.3905243-.3905243-.3905243-1.0236893 0-1.4142135l3.98056247-3.98056252c.39052429-.39052429 1.02368927-.39052429 1.41421356 0z" transform="matrix(-1 0 0 1 20 0)" /></SVG>
);

export default icons;

