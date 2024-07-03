<?php
namespace Elementor\Testing\Core\Base\Mock;

use Elementor\Atomic_Widget_Base;

class Mock_Atomic_Widget extends Atomic_Widget_Base {

    public function get_atomic_controls( $control_id = null ): array {
        return [
            [
                'name' => "content",
                'bind' => 'content',
                'type' => 'text',
                'label' => 'Content',
                'default' => 'Hello, World!',
            ],
            [
                'name' => "tag",
                'bind' => 'tag',
                'type' => 'select',
                'label' => 'Tag',
                'default' => 'h2',
                'options' => [
                    'h1' => 'H1',
                    'h2' => 'H2',
                    'h3' => 'H3',
                    'h4' => 'H4',
                    'h5' => 'H5',
                    'h6' => 'H6',
                ],
            ]
        ];
    }

    public function get_icon() {
        return 'eicon-t-letter';
    }

    public function get_title() {
        return 'Atomic Widget';
    }

    public function get_name() {
        return 'mock-atomic-widget';
    }

    protected function render() {
        $tag = $this->get_settings()['tag'] ?? 'h2';
        $content = $this->get_settings()['content'] ?? 'Hello, World!';

        echo "<$tag>$content</$tag>";
    }
}

