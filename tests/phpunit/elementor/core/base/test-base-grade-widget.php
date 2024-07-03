<?php

namespace Elementor\Testing\Core\Base;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Testing\Core\Base\Mock\Mock_Atomic_Widget;

require_once 'mock/mock-atomic-widget.php';

class Test_Base_Grade_Widget extends Elementor_Test_Base {
    static $content_control = [
        'name' => "content",
        'bind' => 'content',
        'type' => 'text',
        'label' => 'Content',
        'default' => 'Hello, World!',
    ];
    static $tag_control = [
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
    ];

	public function test_overriden_methods() {
        $atomic_widget = new Mock_Atomic_Widget();

        $this->assertEquals( $atomic_widget->get_controls(), []);
        $this->assertEquals( $atomic_widget->get_controls('tag'), null);
		$this->assertEquals( $atomic_widget->get_atomic_controls(), [
            Test_Base_Grade_Widget::$content_control,
            Test_Base_Grade_Widget::$tag_control
        ]);
	}

    public function test_initialized_from_db() {
        $atomic_widget = new Mock_Atomic_Widget([
            'id' => '5a1e8e5',
            'elType' => 'widget',
            'settings' => [
                'tag' => 'h1',
                'content' => 'Another heading'
            ],
            'widgetType' => 'mock-atomic-widget',
            'elements' => [],
        ], []);

        $this->assertEquals( $atomic_widget->get_settings(), [
            'tag' => 'h1',
            'content' => 'Another heading'
        ]);
    }
}
