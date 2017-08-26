var container;
var backgroundCamera, backgroundScene;
var foregroundCamera, foregroundScene;
var uniforms;

init();
animate();

function init() {
		container = document.getElementById( 'container' );

		uniforms = {
				u_time: { type: "f", value: 1.0 },
				u_resolution: { type: "v2", value: new THREE.Vector2() },
				u_mouse: { type: "v2", value: new THREE.Vector2() }
		};

		initBackgroundScene();
		initForegroundScene();

		renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
			depth: false
		});
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.autoClear = false;

		container.appendChild( renderer.domElement );

		onWindowResize();
		window.addEventListener( 'resize', onWindowResize, false );

		document.onmousemove = function(e){
			uniforms.u_mouse.value.x = e.pageX
			uniforms.u_mouse.value.y = e.pageY
		}
}

function initBackgroundScene() {
	backgroundCamera = new THREE.Camera();
	backgroundCamera.position.z = 1;

	backgroundScene = new THREE.Scene();

	var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

	var material = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader: document.getElementById( 'backgroundVertexShader' ).textContent,
		fragmentShader: document.getElementById( 'backgroundFragmentShader' ).textContent
	} );

	var mesh = new THREE.Mesh( geometry, material );
	backgroundScene.add( mesh );
}

function initForegroundScene() {
	foregroundCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
	foregroundCamera.position.z = 10;
	foregroundCamera.up.set( 0, 1, 0 );
	foregroundCamera.lookAt(new THREE.Vector3(0, 0, 0));

	foregroundScene = new THREE.Scene();

	var geometry = new THREE.SphereBufferGeometry( 2, 32, 32 );

	var material = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader: document.getElementById( 'foregroundVertexShader' ).textContent,
		fragmentShader: document.getElementById( 'foregroundFragmentShader' ).textContent
	} );

	var mesh = new THREE.Mesh( geometry, material );
	foregroundScene.add( mesh );
}

function onWindowResize( event ) {
		renderer.setSize( window.innerWidth, window.innerHeight );
		foregroundCamera.aspect =  window.innerWidth / window.innerHeight ;
		foregroundCamera.updateProjectionMatrix();
		uniforms.u_resolution.value.x = renderer.domElement.width;
		uniforms.u_resolution.value.y = renderer.domElement.height;
}

function animate() {
		requestAnimationFrame( animate );
		render();
}

function render() {
		uniforms.u_time.value += 0.05;
		renderer.clear();
		renderer.render( backgroundScene, backgroundCamera );
		renderer.clearDepth();
		renderer.render( foregroundScene, foregroundCamera );
}
