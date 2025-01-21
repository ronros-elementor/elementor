import { handleDuplicatedStyles } from '../../../utils/handle-duplicated-styles';

export class DuplicateElementHook extends $e.modules.hookData.After {
	getCommand() {
		return 'document/elements/duplicate';
	}

	getId() {
		return 'duplicate-element--document/elements/duplicate';
	}

	apply( args, result ) {
		const containers = Array.isArray( result ) ? result : [ result ];

		containers.forEach( handleDuplicatedStyles );
	}
}
export default DuplicateElementHook;
