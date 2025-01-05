import { classesPropTypeUtil } from '@elementor/editor-props';

/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */
export class DuplicateStyles extends $e.modules.editor.CommandContainerBase {
	validateArgs( args ) {
		this.requireArgumentConstructor( 'containers', Array, args );
	}

	randomId( containerId ) {
		return `s-${ containerId }-${ elementorCommon.helpers.getUniqueId() }`;
	}

	updateContainerStyles( container, originalClasses, originalStyles, classesPropKey ) {
		const newStyles = {};

		const changedIds = {}; // Conversion map - {[originalId: string]: newId: string}

		Object.entries( originalStyles ).forEach( ( [ originalStyleId, style ] ) => {
			const newStyleId = this.randomId( container.id );

			newStyles[ newStyleId ] = structuredClone( { ...style, id: newStyleId } );

			changedIds[ originalStyleId ] = newStyleId;
		} );

		const newClasses = classesPropTypeUtil.create(
			originalClasses.map( ( className ) => changedIds[ className ] ?? className ),
		);

		// Update classes array
		$e.internal( 'document/elements/set-settings', {
			container,
			settings: {
				[ classesPropKey ]: newClasses,
			},
		} );

		// Update local styles
		container.model.set( 'styles', newStyles );
	}

	apply( args ) {
		args.containers.forEach( ( { container, originalClasses, originalStyles, classesPropKey } ) => {
			this.updateContainerStyles( container, originalClasses, originalStyles, classesPropKey );
		} );
	}
}

export default DuplicateStyles;
