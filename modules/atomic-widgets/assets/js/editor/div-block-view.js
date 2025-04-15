import DivBlockEmptyView from './container/div-block-empty-view';

const BaseElementView = elementor.modules.elements.views.BaseElement;
const DivBlockView = BaseElementView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-e-div-block-content' ),

	emptyView: DivBlockEmptyView,

	tagName() {
		if ( this.haveLink() ) {
			return 'a';
		}

		const tagControl = this.model.getSetting( 'tag' );
		const tagControlValue = tagControl?.value || tagControl;

		return tagControlValue || 'div';
	},

	getChildViewContainer() {
		this.childViewContainer = '';

		return Marionette.CompositeView.prototype.getChildViewContainer.apply( this, arguments );
	},

	className() {
		return `${ BaseElementView.prototype.className.apply( this ) } e-con ${ this.getClassString() }`;
	},

	// TODO: Copied from `views/column.js`.
	ui() {
		var ui = BaseElementView.prototype.ui.apply( this, arguments );

		ui.percentsTooltip = '> .elementor-element-overlay .elementor-column-percents-tooltip';

		return ui;
	},

	// TODO: Copied from `views/column.js`.
	attachElContent() {
		BaseElementView.prototype.attachElContent.apply( this, arguments );

		const $tooltip = jQuery( '<div>', {
			class: 'elementor-column-percents-tooltip',
			'data-side': elementorCommon.config.isRTL ? 'right' : 'left',
		} );

		this.$el.children( '.elementor-element-overlay' ).append( $tooltip );
	},

	// TODO: Copied from `views/column.js`.
	getPercentSize( size ) {
		if ( ! size ) {
			size = this.el.getBoundingClientRect().width;
		}

		return +( size / this.$el.parent().width() * 100 ).toFixed( 3 );
	},

	// TODO: Copied from `views/column.js`.
	getPercentsForDisplay() {
		const width = +this.model.getSetting( 'width' ) || this.getPercentSize();

		return width.toFixed( 1 ) + '%';
	},

	renderOnChange( settings ) {
		const changed = settings.changedAttributes();

		if ( ! changed ) {
			return;
		}

		BaseElementView.prototype.renderOnChange.apply( this, settings );

		if ( changed.classes ) {
			// Rebuild the whole class attribute to remove previous outdated classes
			this.$el.attr( 'class', this.className() );

			return;
		}

		this.$el.addClass( this.getClasses() );

		if ( this.isTagChanged( changed ) ) {
			this.rerenderEntireView();
		}
	},

	isTagChanged( changed ) {
		return ( changed?.tag !== undefined || changed?.link !== undefined ) && this._parent && this.tagName() !== this.el.tagName;
	},

	rerenderEntireView() {
		const parent = this._parent;
		this._parent.removeChildView( this );
		parent.addChild( this.model, DivBlockView, this._index );
	},

	onRender() {
		BaseElementView.prototype.onRender.apply( this, arguments );
		this.handleLink();

		// Defer to wait for everything to render.
		setTimeout( () => {
			this.droppableInitialize();
		} );
	},

	handleLink() {
		const href = this.getHref();

		if ( ! href ) {
			return;
		}

		this.$el.attr( 'href', href );
	},

	haveLink() {
		return !! this.model.getSetting( 'link' )?.value?.destination?.value;
	},

	getHref() {
		if ( ! this.haveLink() ) {
			return;
		}

		const { $$type, value } = this.model.getSetting( 'link' ).value.destination;
		const isPostId = 'number' === $$type;
		const hrefPrefix = isPostId ? elementor.config.home_url + '/?p=' : '';

		return hrefPrefix + value;
	},

	droppableInitialize() {
		this.$el.html5Droppable( this.getDroppableOptions() );
	},

	/**
	 * Add a `Save as Template` button to the context menu.
	 *
	 * @return {Object} groups
	 */
	getContextMenuGroups() {
		var groups = BaseElementView.prototype.getContextMenuGroups.apply( this, arguments ),
			transferGroupClipboardIndex = groups.indexOf( _.findWhere( groups, { name: 'clipboard' } ) );

		groups.splice( transferGroupClipboardIndex + 1, 0, {
			name: 'save',
			actions: [
				{
					name: 'save',
					title: __( 'Save as Template', 'elementor' ),
					callback: this.saveAsTemplate.bind( this ),
					isEnabled: () => ! this.getContainer().isLocked(),
				},
			],
		} );

		return groups;
	},

	saveAsTemplate() {
		$e.route( 'library/save-template', {
			model: this.model,
		} );
	},

	isDroppingAllowed() {
		return true;
	},

	behaviors() {
		const behaviors = BaseElementView.prototype.behaviors.apply( this, arguments );

		_.extend( behaviors, {
			Sortable: {
				behaviorClass: require( 'elementor-behaviors/sortable' ),
				elChildType: 'widget',
			},
		} );

		return elementor.hooks.applyFilters( 'elements/e-div-block/behaviors', behaviors, this );
	},

	/**
	 * @return {{}} options
	 */
	getSortableOptions() {
		return {
			preventInit: true,
		};
	},

	getDroppableAxis() {
		if ( this.isHorizontalAxis() ) {
			return 'horizontal';
		}

		return 'vertical';
	},

	isHorizontalAxis() {
		const styles = window.getComputedStyle( this.$el[ 0 ] );

		return 'flex' === styles.display &&
			[ 'row', 'row-reverse' ].includes( styles.flexDirection );
	},

	getDroppableOptions() {
		const items = '> .elementor-element, > .elementor-empty-view .elementor-first-add';

		return {
			axis: this.getDroppableAxis(),
			items,
			groups: [ 'elementor-element' ],
			horizontalThreshold: 0,
			isDroppingAllowed: this.isDroppingAllowed.bind( this ),
			currentElementClass: 'elementor-html5dnd-current-element',
			placeholderClass: 'elementor-sortable-placeholder elementor-widget-placeholder',
			hasDraggingOnChildClass: 'e-dragging-over',
			getDropContainer: () => this.getContainer(),
			onDropping: ( side, event ) => {
				event.stopPropagation();

				// Triggering drag end manually, since it won't fired above iframe
				elementor.getPreviewView().onPanelElementDragEnd();

				const draggedView = elementor.channels.editor.request( 'element:dragged' ),
					draggingInSameParent = ( draggedView?.parent === this ),
					containerSelector = event.currentTarget.parentElement;

				let $elements = jQuery( containerSelector ).find( '> .elementor-element' );

				// Exclude the dragged element from the indexing calculations.
				if ( draggingInSameParent ) {
					$elements = $elements.not( draggedView.$el );
				}

				const widgetsArray = Object.values( $elements );

				let newIndex = widgetsArray.indexOf( event.currentTarget );

				// Plus one in order to insert it after the current target element.
				if ( this.shouldIncrementIndex( side ) ) {
					newIndex++;
				}

				// User is sorting inside a Container.
				if ( draggedView ) {
					// Prevent the user from dragging a parent container into its own child container
					const draggedId = draggedView.getContainer().id;

					let currentTargetParentContainer = this.container;

					while ( currentTargetParentContainer ) {
						if ( currentTargetParentContainer.id === draggedId ) {
							return;
						}

						currentTargetParentContainer = currentTargetParentContainer.parent;
					}

					// Reset the dragged element cache.
					elementor.channels.editor.reply( 'element:dragged', null );

					$e.run( 'document/elements/move', {
						container: draggedView.getContainer(),
						target: this.getContainer(),
						options: {
							at: newIndex,
						},
					} );

					return;
				}

				// User is dragging an element from the panel.
				this.onDrop( event, { at: newIndex } );
			},
		};
	},

	getEditButtons() {
		const elementData = elementor.getElementData( this.model ),
			editTools = {};

		if ( $e.components.get( 'document/elements' ).utils.allowAddingWidgets() ) {
			editTools.add = {
				/* Translators: %s: Element Name. */
				title: sprintf( __( 'Add %s', 'elementor' ), elementData.title ),
				icon: 'plus',
			};

			editTools.edit = {
				/* Translators: %s: Element Name. */
				title: sprintf( __( 'Edit %s', 'elementor' ), elementData.title ),
				icon: 'handle',
			};
		}

		if ( ! this.getContainer().isLocked() ) {
			if ( elementor.getPreferences( 'edit_buttons' ) && $e.components.get( 'document/elements' ).utils.allowAddingWidgets() ) {
				editTools.duplicate = {
					/* Translators: %s: Element Name. */
					title: sprintf( __( 'Duplicate %s', 'elementor' ), elementData.title ),
					icon: 'clone',
				};
			}

			editTools.remove = {
				/* Translators: %s: Element Name. */
				title: sprintf( __( 'Delete %s', 'elementor' ), elementData.title ),
				icon: 'close',
			};
		}

		return editTools;
	},

	shouldIncrementIndex( side ) {
		if ( ! this.draggingOnBottomOrRightSide( side ) ) {
			return false;
		}

		return ! this.emptyViewIsCurrentlyBeingDraggedOver();
	},

	draggingOnBottomOrRightSide( side ) {
		return [ 'bottom', 'right' ].includes( side );
	},

	emptyViewIsCurrentlyBeingDraggedOver() {
		return this.$el.find( '> .elementor-empty-view > .elementor-first-add.elementor-html5dnd-current-element' ).length > 0;
	},

	/**
	 * Toggle the `New Section` view when clicking the `add` button in the edit tools.
	 *
	 * @return {void}
	 */
	onAddButtonClick() {
		if ( this.addSectionView && ! this.addSectionView.isDestroyed ) {
			this.addSectionView.fadeToDeath();

			return;
		}

		const addSectionView = new elementor.modules.elements.components.AddSectionView( {
			at: this.model.collection.indexOf( this.model ),
		} );

		addSectionView.render();

		this.$el.before( addSectionView.$el );

		addSectionView.$el.hide();

		// Delaying the slide down for slow-render browsers (such as FF)
		setTimeout( function() {
			addSectionView.$el.slideDown( null, function() {
				// Remove inline style, for preview mode.
				jQuery( this ).css( 'display', '' );
			} );
		} );

		this.addSectionView = addSectionView;
	},

	getClasses() {
		return this.options?.model?.getSetting( 'classes' )?.value || [];
	},

	getClassString() {
		const classes = this.getClasses();
		const base = this.getBaseClass();

		return [ base, ...classes ].join( ' ' );
	},

	getBaseClass() {
		return 'e-flexbox' === this.options?.model?.getSetting( 'elType' ) ? 'e-flexbox-base' : 'e-div-block-base';
	},
} );

module.exports = DivBlockView;
