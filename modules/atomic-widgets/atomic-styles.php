<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Base\Style_Transformer_Base;
use Elementor\Core\Files\CSS\Post;
use Elementor\Element_Base;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use Elementor\Modules\AtomicWidgets\Styles\Transformers\Array_Transformer;
use Elementor\Modules\AtomicWidgets\Styles\Transformers\Size_Transformer;
use Elementor\Plugin;

class Atomic_Styles {
	/**
	 * @var array<string, Style_Transformer_Base> $transformers
	 */
	private array $style_transformers = [];

	/**
	 * @var array<string, array{direction: 'min' | 'max', value: int, is_enabled: boolean}> $breakpoints
	 */
	private array $breakpoints = [];

	public function register_hooks() {
		add_filter(
			'elementor/atomic-widgets/styles/transformers',
			fn ( array $transformers) => $this->register_style_transformers( $transformers )
		);
	}

	/**
	 * @param array<int, Style_Transformer_Base> $transformers
	 * @return array<string, Style_Transformer_Base>
	 */
	private function register_style_transformers( array $transformers ): array {
		array_push(
			$transformers,
			new Size_Transformer(),
			new Array_Transformer(),
		);

		return $transformers;
	}

	private function get_style_transformers(): array {
		if ( count( $this->style_transformers ) === 0 ) {
			$this->style_transformers = $this->build_style_transformers();
		}

		return $this->style_transformers;
	}

	private function build_style_transformers(): array {
		$transformers = apply_filters( 'elementor/atomic-widgets/styles/transformers', [] );

		$transformers_map = [];

		foreach ( $transformers as $transformer ) {
			$transformers_map[ $transformer->type() ] = $transformer;
		}

		return $transformers_map;
	}

	private function get_breakpoints(): array {
		if ( count( $this->breakpoints ) === 0 ) {
			$this->breakpoints = $this->build_breakpoints();
		}

		return $this->breakpoints;
	}

	private function build_breakpoints(): array {
		return Plugin::$instance->breakpoints->get_breakpoints_config();
	}

	public function convert_styles_to_css( array $styles ): string {
		$transformers = $this->get_style_transformers();
		$breakpoints = $this->get_breakpoints();

		$styles_renderer = new Styles_Renderer( [
			'transformers' => $transformers,
			'breakpoints' => $breakpoints,
		] );

		return $styles_renderer->render( $styles );
	}
}
