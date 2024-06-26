import ReactUtils from 'elementor-utils/react';
import App from './app';
import { __ } from '@wordpress/i18n';
import AiPromotionInfotipWrapper from './components/ai-promotion-infotip-wrapper';
import { shouldShowPromotionIntroduction } from './utils/promotion-introduction-session-validator';

export default class AiBehavior extends Marionette.Behavior {
	initialize() {
		this.type = 'text';
		this.controlType = 'text';
		this.buttonLabel = __( 'Write with AI', 'elementor' );
		this.editButtonLabel = __( 'Edit with AI', 'elementor' );
		this.isLabelBlock = false;
		this.additionalOptions = {};
		this.context = {};
		this.config = window.ElementorAiConfig;
	}

	ui() {
		return {
			aiButton: '.e-ai-button',
		};
	}

	events() {
		return {
			'click @ui.aiButton': 'onAiButtonClick',
		};
	}

	onAiButtonClick( event ) {
		event.stopPropagation();

		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto';

		const isRTL = elementorCommon.config.isRTL;

		const rootElement = document.createElement( 'div' );
		document.body.append( rootElement );

		window.elementorAiCurrentContext = this.getOption( 'context' );

		const { unmount } = ReactUtils.render( (
			<App
				type={ this.getOption( 'type' ) }
				controlType={ this.getOption( 'controlType' ) }
				getControlValue={ this.getOption( 'getControlValue' ) }
				setControlValue={ this.getOption( 'setControlValue' ) }
				additionalOptions={ this.getOption( 'additionalOptions' ) }
				onClose={ () => {
					unmount();
					rootElement.remove();
				} }
				colorScheme={ colorScheme }
				isRTL={ isRTL }
			/>
		), rootElement );
	}

	getAiButtonLabel() {
		const defaultValue = this.getOption( 'additionalOptions' )?.defaultValue;
		const currentValue = this.getOption( 'getControlValue' )();
		const isMedia = 'media' === this.getOption( 'type' );
		const isDefaultValue = ( ! isMedia && defaultValue === currentValue ) || ( isMedia && currentValue?.url === defaultValue?.url );

		return isDefaultValue ? this.getOption( 'buttonLabel' ) : this.getOption( 'editButtonLabel' );
	}

	getPromotionTexts( controlType ) {
		switch ( controlType ) {
			case 'textarea':
				return {
					header: __( "Writer's block? Never again!", 'elementor' ),
					contentText: __( 'Elementor AI can draft your initial content and help you beat the blank page.', 'elementor' ),
				};
			case 'media':
				return {
					header: __( 'Unleash your creativity.', 'elementor' ),
					contentText: __( 'With Elementor AI, you can generate any image you would like for your website.', 'elementor' ),
				};
			case 'media-edit':
				return {
					header: __( 'Unleash your creativity.', 'elementor' ),
					contentText: __( 'With Elementor AI, you can edit images for your website.', 'elementor' ),
				};
			case 'code':
				return {
					header: __( 'Let the elves take care of it.', 'elementor' ),
					contentText: __( 'Elementor AI can help you write code faster and more efficiently.', 'elementor' ),
				};
			default:
				return null;
		}
	}

	isMediaPlaceholder( controlType ) {
		if ( controlType !== 'media' ) {
			return false;
		}
		return this.view.options.container.settings.get( this.view.model.get( 'name' ) )?.url?.includes( 'elementor/assets/images/placeholder.png' );
	}

	onRender() {
		const isPromotion = ! this.config.is_get_started;
		const buttonLabel = this.getAiButtonLabel();

		const $button = jQuery( '<button>', {
			class: 'e-ai-button',
		} );

		if ( ! isPromotion ) {
			$button.addClass( 'e-active' );
		}

		$button.html( '<i class="eicon-ai"></i>' );

		if ( this.getOption( 'isLabelBlock' ) && isPromotion ) {
			$button.append( ' ' + buttonLabel );
		} else {
			$button.tipsy( {
				gravity: 's',
				title() {
					return buttonLabel;
				},
			} );
		}

		let $wrap = this.$el.find( '.elementor-control-responsive-switchers' );
		if ( ! $wrap.length ) {
			$wrap = this.$el.find( '.elementor-control-title' );
		}

		$wrap.after(
			$button,
		);

		let controlType = this.view.model.get( 'type' );

		if ( 'media' === controlType && ! this.isMediaPlaceholder( controlType ) ) {
			controlType = 'media-edit';
		}
		const promotionTexts = this.getPromotionTexts( controlType );
		if ( ! promotionTexts ) {
			return;
		}

		if ( ! shouldShowPromotionIntroduction( sessionStorage ) ) {
			return;
		}
		setTimeout( () => {
			const rootBox = $button[ 0 ].getBoundingClientRect();
			if ( ! rootBox || 0 === rootBox.width || 0 === rootBox.height ) {
				return;
			}

			const rootElement = document.createElement( 'div' );
			document.body.append( rootElement );

			const mainActionText = isPromotion ? __( 'Try it for free', 'elementor' ) : __( 'Try it now', 'elementor' );
			const { unmount } = ReactUtils.render( (
				<AiPromotionInfotipWrapper
					anchor={ $button[ 0 ] }
					header={ promotionTexts.header }
					contentText={ promotionTexts.contentText }
					mainActionText={ mainActionText }
					controlType={ controlType }
					unmountAction={ () => {
						unmount();
					} }
					colorScheme={ elementor?.getPreferences?.( 'ui_theme' ) || 'auto' }
					isRTL={ elementorCommon.config.isRTL }
				/>
			), rootElement );
		}, 1000 );
	}
}
