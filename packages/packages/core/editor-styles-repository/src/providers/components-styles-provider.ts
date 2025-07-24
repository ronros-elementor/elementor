import {
	getCurrentDocumentId,
	getElements,
	getWidgetsCache,
	styleRerenderEvents,
	type V1Element,
	type V1ElementModelProps,
} from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { __privateListenTo as listenTo } from '@elementor/editor-v1-adapters';

import { ActiveDocumentMustExistError } from '../errors';
import { createStylesProvider } from '../utils/create-styles-provider';

export const COMPONENTS_STYLES_RESERVED_LABEL = 'components-';

export const componentsStylesProvider = createStylesProvider( {
	key: () => {
		const documentId = getCurrentDocumentId();

		if ( ! documentId ) {
			throw new ActiveDocumentMustExistError();
		}

		return `${ COMPONENTS_STYLES_RESERVED_LABEL }${ documentId }`;
	},
	priority: 50,
	subscribe: ( cb ) => listenTo( styleRerenderEvents, cb ),
	actions: {
		all: () => {
			let elements = getElements();

			elements = elements.filter( isComponent );

			return elements.flatMap( getComponentStyles );
		},

		get: () => {
			return null;
		},
	},
} );

function isComponent( element: V1Element ): boolean {
	return element.model.get( 'widgetType' ) === 'e-component';
}

function getComponentStyles(): StyleDefinition[] {
	const { elements_data: elementsData = [] } = getWidgetsCache()?.[ 'e-component' ] ?? {};

	const iterate = ( el: V1ElementModelProps ): StyleDefinition[] => {
		let nestedStyles = [];

		if ( el.elements ) {
			nestedStyles = ( el.elements as V1ElementModelProps[] ).flatMap( iterate );
		}

		if ( el.styles ) {
			return [ ...nestedStyles, ...Object.values( el.styles ) ];
		}

		return [ ...nestedStyles ];
	};

	return elementsData.flatMap( iterate );
}
