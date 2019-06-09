<?php
/**
 * Test includes/class-coblocks-body-classes.php
 *
 * @package CoBlocks
 */
class CoBlocks_Form_Tests extends WP_UnitTestCase {

	private $coblocks_form;

	public function setUp() {

		parent::setUp();

		$this->coblocks_form = new CoBlocks_Form();

		set_current_screen( 'dashboard' );

	}

	public function tearDown() {

		parent::tearDown();

	}

	/**
	 * Test the class constants
	 */
	public function test_class_constants() {

		$reflection = new ReflectionClass( $this->coblocks_form );

		$expected = [
			'GCAPTCHA_VERIFY_URL',
		];

		foreach ( $expected as $constant ) {

			if ( ! array_key_exists( $constant, $reflection->getConstants() ) ) {

				$this->fail( "$constant is not defined." );

			}
		}

		$this->assertTrue( true );

	}

	/**
	 * Test the constructor
	 */
	public function test_construct() {

		$actions = [
			[ 'init', 'register_settings' ],
			[ 'init', 'register_form_blocks' ],
			[ 'wp_enqueue_scripts', 'form_recaptcha_assets' ],
		];

		foreach ( $actions as $action_data ) {

			$priority = isset( $action_data[2] ) ? $action_data[2] : 10;

			if ( ! has_action( $action_data[0], [ $this->coblocks_form, $action_data[1] ] ) ) {

				$this->fail( "$action_data[0] is not attached to CoBlocks:$action_data[1]. It might also have the wrong priority (validated priority: $priority)" );

			}
		}

		$this->assertTrue( true );

	}

	/**
	 * Test the settings are registered correctly
	 */
	public function test_register_settings() {

		$this->coblocks_form->register_settings();

		$settings = [
			'coblocks_google_recaptcha_site_key',
			'coblocks_google_recaptcha_secret_key',
		];

		foreach ( $settings as $registered_setting ) {

			if ( ! array_key_exists( $registered_setting, get_registered_settings() ) ) {

				$this->fail( "$constant is not defined." );

			}
		}

		$this->assertTrue( true );

	}

	/**
	 * Test the form block assets DO NOT load when no form block is present
	 */
	public function test_no_form_assets_load() {

		$post_id = wp_insert_post(
			[
				'post_author'  => 1,
				'post_content' => '<!-- wp:coblocks/gallery-masonry --><!-- /wp:coblocks/gallery-masonry -->',
				'post_title'   => 'CoBlocks No Form',
				'post_status'  => 'publish',
			]
		);

		global $post;

		$post = get_post( $post_id );

		$this->coblocks_form->form_recaptcha_assets();

		do_action( 'wp_enqueue_scripts' );

		$wp_scripts = wp_scripts();

		$this->assertNotContains( 'google-recaptcha', $wp_scripts->queue );

	}

	/**
	 * Test the form block assets load when a form block is present
	 */
	public function test_form_assets_load() {

		update_option( 'coblocks_google_recaptcha_site_key', '123' );
		update_option( 'coblocks_google_recaptcha_secret_key', '123' );

		$post_id = wp_insert_post(
			[
				'post_author'  => 1,
				'post_content' => '<!-- wp:coblocks/form --><!-- /wp:coblocks/form -->',
				'post_title'   => 'CoBlocks Form',
				'post_status'  => 'publish',
			]
		);

		global $post;

		$post = get_post( $post_id );

		$this->coblocks_form->form_recaptcha_assets();

		do_action( 'wp_enqueue_scripts' );

		$wp_scripts = wp_scripts();

		$form_block_assets = [
			'google-recaptcha',
			'coblocks-google-recaptcha',
		];

		foreach ( $form_block_assets as $form_block_asset ) {

			if ( ! in_array( $form_block_asset, $wp_scripts->queue, true ) ) {

				$this->fail( "$form_block_asset is not enqueued." );

			}
		}

		$this->assertTrue( true );

	}

	/**
	 * Test the form block assets localized data is set correctly
	 */
	public function test_form_assets_localized_data() {

		update_option( 'coblocks_google_recaptcha_site_key', '123' );
		update_option( 'coblocks_google_recaptcha_secret_key', '123' );

		$post_id = wp_insert_post(
			[
				'post_author'  => 1,
				'post_content' => '<!-- wp:coblocks/form --><!-- /wp:coblocks/form -->',
				'post_title'   => 'CoBlocks Form',
				'post_status'  => 'publish',
			]
		);

		global $post;

		$post = get_post( $post_id );

		$this->coblocks_form->form_recaptcha_assets();

		do_action( 'wp_enqueue_scripts' );

		$wp_scripts = wp_scripts();

		$this->assertRegExp( '/"recaptchaSiteKey":"123"/', $wp_scripts->registered['coblocks-google-recaptcha']->extra['data'] );

	}

	/**
	 * Test the blocks are registered properly
	 *
	 * @expectedIncorrectUsage WP_Block_Type_Registry::register
	 */
	public function test_register_blocks() {

		$this->coblocks_form->register_form_blocks();

		$registered_blocks = WP_Block_Type_Registry::get_instance()->get_all_registered();

		$coblocks_blocks = [
			'coblocks/form',
			'coblocks/field-name',
			'coblocks/field-email',
			'coblocks/field-textarea',
		];

		foreach ( $coblocks_blocks as $registered_block ) {

			if ( ! array_key_exists( $registered_block, $registered_blocks ) ) {

				$this->fail( "$registered_block is not registered." );

			}
		}

		$this->assertTrue( true );

	}

	/**
	 * Test the form markup is as expected
	 */
	public function test_render_form() {

		update_option( 'coblocks_google_recaptcha_site_key', '123' );
		update_option( 'coblocks_google_recaptcha_secret_key', '123' );

		$this->expectOutputRegex( '/<div class="coblocks-form" id="(.*?)">/' );

		echo $this->coblocks_form->render_form( [], '<!-- wp:coblocks/form --><!-- wp:coblocks/field-name --><!-- /wp:coblocks/field-name --><!-- wp:coblocks/field-email --><!-- /wp:coblocks/field-email --><!-- wp:coblocks/field-textarea --><!-- /wp:coblocks/field-textarea --><!-- /wp:coblocks/form -->' );

	}

	/**
	 * Test the form markup is as expected when it is submitted
	 */
	public function test_render_form_submission() {

		$this->markTestSkipped( 'Todo: Figure out how to set the global $_POST to simulate a form submission.' );

		$_POST['form-hash'] = '99f3a3add5da5d0bb04ce41c7142688f64e73ab6';

		$coblocks_form = new CoBlocks_Form();

		$this->expectOutputRegex( '/<div class="coblocks-form__submitted">Your message was sent:/' );

		echo $coblocks_form->render_form( [], '<!-- wp:coblocks/form --><!-- /wp:coblocks/form -->' );

	}

	/**
	 * Test the name field markup is as expected, when it's a single field
	 */
	public function test_render_field_name() {

		$this->expectOutputRegex( '/<input type="text" id="name" name="field-name\[value\]" class="coblocks-field coblocks-field--name" required \/>/' );

		$atts = [
			'label'       => 'Name',
			'required'    => true,
			'hasLastName' => false,
		];

		echo $this->coblocks_form->render_field_name( $atts, '' );

	}

	/**
	 * Test the name field markup is as expected, when the last name is displayed
	 */
	public function test_render_field_name_has_last_name() {

		$this->expectOutputRegex( '/<div class="coblocks-form__inline-fields">/' );

		$atts = [
			'label'          => 'Name',
			'required'       => true,
			'hasLastName'    => true,
			'labelFirstName' => 'First Name',
			'labelLastName'  => 'Last Name',
		];

		echo $this->coblocks_form->render_field_name( $atts, '' );

	}

	/**
	 * Test the email field markup is as expected
	 */
	public function test_render_field_email() {

		$this->expectOutputRegex( '/<input type="email" id="email" name="field-email\[value\]" class="coblocks-field coblocks-field--email"  \/>/' );

		echo $this->coblocks_form->render_field_email( [], '' );

	}

	/**
	 * Test the message field markup is as expected
	 */
	public function test_render_field_textarea() {

		$this->expectOutputRegex( '/<textarea name="field-message\[value\]" id="message" class="coblocks-field coblocks-textarea" rows="20"><\/textarea>/' );

		echo $this->coblocks_form->render_field_textarea( [], '' );

	}

	/**
	 * Test the field label markup is as expected
	 */
	public function test_render_field_label() {

		$this->expectOutputRegex( '/<label for="field-label" class="coblocks-label">Field Label <span class="required">&#042;<\/span><\/label>/' );

		$atts = [
			'label'    => 'Field Label',
			'required' => true,
		];

		$object    = new CoBlocks_Form();
		$reflector = new ReflectionClass( 'CoBlocks_Form' );
		$method    = $reflector->getMethod( 'render_field_label' );

		$method->setAccessible( true );

		echo $method->invokeArgs( $object, [ $atts, '' ] );

	}

	/**
	 * Test the field label markup is as expected
	 */
	public function test_render_submit_button() {

		$this->expectOutputRegex( '/<button type="submit" class="wp-block-button__link custom-button-class" style=\'background-color: #B4D455;color: #333333;\'>Submit<\/button>/' );

		$atts = [
			'submitButtonClasses'         => 'custom-button-class',
			'customBackgroundButtonColor' => '#B4D455',
			'customTextButtonColor'       => '#333333',
		];

		$object    = new CoBlocks_Form();
		$reflector = new ReflectionClass( 'CoBlocks_Form' );
		$method    = $reflector->getMethod( 'render_submit_button' );

		$method->setAccessible( true );

		echo $method->invokeArgs( $object, [ $atts ] );

	}

	/**
	 * Test the form submission works as expected
	 */
	public function test_process_form_submission() {

		$this->markTestSkipped( 'Todo: Figure out how to set the global $_POST to simulate a form submission.' );

	}

	/**
	 * Test the html email headers return as expected
	 */
	public function test_enable_html_email() {

		$this->assertEquals( $this->coblocks_form->enable_html_email(), 'text/html' );

	}

	/**
	 * Test the success message markup returns as expected
	 */
	public function test_success_message() {

		$this->expectOutputRegex( '/<div class="coblocks-form__submitted">Your message was sent: <\/div>/' );

		$this->coblocks_form->success_message();

	}

	/**
	 * Test the recaptcha verifies
	 */
	public function test_verify_recaptcha() {

		$this->markTestSkipped( 'Todo: Figure out how to test the recaptcha verification checks.' );

	}
}
