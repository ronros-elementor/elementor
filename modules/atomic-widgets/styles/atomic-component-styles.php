<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Base\Document;
use Elementor\Modules\AtomicWidgets\Cache_Validity;
use Elementor\Modules\AtomicWidgets\Utils;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Plugin;
use const Elementor\Modules\AtomicWidgets\Elements\Component\MOCK_DOCUMENT_ID as MOCK_COMPONENT_DOCUMENT_ID;

class Atomic_Widget_Styles {
	const STYLES_KEY = 'components';

	public function register_hooks() {
		add_action( 'elementor/atomic-widgets/styles/register', function( Atomic_Styles_Manager $styles_manager, array $post_ids ) {
			$this->register_styles( $styles_manager, $post_ids );
		}, 30, 2 );

		add_action( 'elementor/document/after_save', fn( Document $document ) => $this->invalidate_cache(
			[ $document->get_main_post()->ID ]
		), 20, 2 );

		add_action(
			'elementor/core/files/clear_cache',
			fn() => $this->invalidate_cache(),
		);
	}

	private function register_styles( Atomic_Styles_Manager $styles_manager, array $post_ids ) {
		foreach ( $post_ids as $post_id ) {
			$get_styles = fn() => $this->parse_post_styles( $post_id );

			$style_key = $this->get_style_key( $post_id );

			$styles_manager->register( $style_key, $get_styles, [ self::STYLES_KEY, $post_id ] );
		}
	}

	private function parse_post_styles( $post_id ) {
		$document = Plugin::$instance->documents->get_doc_for_frontend( $post_id );

		if ( ! $document ) {
			return [];
		}

		$elements_data = $document->get_elements_data();

		if ( empty( $elements_data ) ) {
			return [];
		}

		$components = [];

		Plugin::$instance->db->iterate_data( $elements_data, function( $element_data ) use ( &$components ) {
			if( isset( $element_data['widgetType'] ) && $element_data['widgetType'] === 'e-component' ) {
				$components = array_merge( $components, $element_data );
			}
		} );

		if ( empty( $components ) ) {
			return [];
		}

		$components_styles = [];

		Plugin::$instance->db->iterate_data( $elements_data, function( $element_data ) use ( &$components_styles ) {
			$components_styles = array_merge( $components_styles, $this->parse_component_style( $element_data ) );
		});
	}

	private function parse_component_style( array $element_data ) {
		if( isset( $element_data['widgetType'] ) && $element_data['widgetType'] === 'e-component' ) {
			return $this->parse_post_styles( MOCK_COMPONENT_DOCUMENT_ID );
		}

		$element_type = Atomic_Elements_Utils::get_element_type( $element_data );
		$element_instance = Atomic_Elements_Utils::get_element_instance( $element_type );

		if ( ! Utils::is_atomic( $element_instance ) ) {
			return [];
		}

		return [];
	}

	private function invalidate_cache( ?array $post_ids = null ) {
		$cache_validity = new Cache_Validity();

		$cache_validity->invalidate( [ self::STYLES_KEY ] );

		if( empty( $post_ids ) ) {
			return;
		}

		foreach ( $post_ids as $post_id ) {
			$cache_validity->invalidate( [ self::STYLES_KEY, $post_id ] );
		}
	}

	private function get_style_key( $post_id ) {
		return self::STYLES_KEY . '-' . $post_id;
	}
}
