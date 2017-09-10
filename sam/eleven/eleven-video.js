var blurShader = {
	uniforms: {
		tDiffuse: {value:null},
		radius: {value: 1.0},
		dir: {value: new THREE.Vector2(1.0, 0.0)},
		u_time: {value: 0.0}
	},
	vertexShader: document.getElementById( 'standardVertexShader' ).textContent,
	fragmentShader: document.getElementById( 'blurFragmentShader' ).textContent
}

var radialBlurShader = {
	uniforms: {
		tDiffuse: {value:null},
		lightPosition: {value: new THREE.Vector2(0.5, 0.5)},
		exposure: {value: 0.24},
		decay: {value: 0.95},
		density: {value: 0.30},
		weight: {value: 0.4},
		samples: {value: 12},
		u_time: {value: 0.0},
		start_tint: {value: new THREE.Vector3(1.0, 0.5, 0.3)},
		end_tint: {value: new THREE.Vector3(0.9, 0.3, 0.1)}
	},
	vertexShader: document.getElementById( 'standardVertexShader' ).textContent,
	fragmentShader: document.getElementById( 'radialBlurFragmentShader' ).textContent
}

var additiveShader = {
	uniforms: {
		tDiffuse: {value:null},
		tAdd: {value:null},
		u_time: {value: 0.0}
	},
	vertexShader: document.getElementById( 'standardVertexShader' ).textContent,
	fragmentShader: document.getElementById( 'additiveFragmentShader' ).textContent
}

var container;
var renderer, camera, scene;
var uniforms;
var blurPasses = [];

var realMeshes = [];
var occludingMeshes = [];

var occlusionComposer, occlusionRenderTarget, composer;

var DEFAULT_LAYER = 0;
var OCCLUSION_LAYER = 1;
var BOX_COUNT = 100;

init();
animate();

function init() {
		container = document.getElementById( 'container' );

		uniforms = {
				u_time: { type: "f", value: 1.0 },
				u_resolution: { type: "v2", value: new THREE.Vector2() },
				u_mouse: { type: "v2", value: new THREE.Vector2() }
		};

		initScene();

		renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		renderer.setPixelRatio( window.devicePixelRatio );

		container.appendChild( renderer.domElement );

		onWindowResize();
		window.addEventListener( 'resize', onWindowResize, false );

		initPostProcessing();

		document.onmousemove = function(e){
			uniforms.u_mouse.value.x = e.pageX
			uniforms.u_mouse.value.y = e.pageY
		}
}

function initScene() {
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 50 );
	camera.position.y = 0;
	camera.position.z = 10;
	camera.up.set( 0, 1, 0 );
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	scene = new THREE.Scene();

	// Ambient light so you always see something
	var ambientLight = new THREE.AmbientLight(0xffffee, 0.1 );
	scene.add(ambientLight);

	// Point light in the distance
	var pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(0, 0, 0);
	scene.add(pointLight);

	// Next add a big sphere
	var lightSphereGeo = new THREE.SphereBufferGeometry(1.5, 16, 16);
	var lightSphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
	var lightSphere = new THREE.Mesh(lightSphereGeo, lightSphereMat);
	lightSphere.layers.set( OCCLUSION_LAYER );
	scene.add(lightSphere);

	initBoxes();
}

function initPostProcessing() {
	occlusionRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
	occlusionComposer = new THREE.EffectComposer( renderer, occlusionRenderTarget );
	occlusionComposer.addPass( new THREE.RenderPass(scene, camera) );
	var radialBlurPass = new THREE.ShaderPass( radialBlurShader );
	blurPasses.push(radialBlurPass);
	radialBlurPass.needsSwap = false;
	occlusionComposer.addPass(radialBlurPass);

	composer = new THREE.EffectComposer( renderer );
	composer.addPass( new THREE.RenderPass(scene, camera) );
	var additivePass = new THREE.ShaderPass( additiveShader );
	additivePass.uniforms.tAdd.value = occlusionRenderTarget.texture;
	composer.addPass(additivePass);
	additivePass.renderToScreen = true;
}

function onWindowResize( event ) {
		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.aspect =  window.innerWidth / window.innerHeight ;
		camera.updateProjectionMatrix();
		uniforms.u_resolution.value.x = renderer.domElement.width;
		uniforms.u_resolution.value.y = renderer.domElement.height;
}

function animate() {
		requestAnimationFrame( animate );
		render();
		updateBoxPositions();
}

function initBoxes() {
	var boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
	var boxMat = new THREE.MeshPhongMaterial({ color: 0xfe5172 });
	var blackBoxMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
	for (var i=0; i<BOX_COUNT; i++) {
		var boxMesh = new THREE.Mesh(boxGeometry, boxMat);
		boxMesh.position.setZ(2);
		boxMesh.layers.set( DEFAULT_LAYER );
		scene.add(boxMesh);
		realMeshes.push(boxMesh);
		boxMesh.position.setX( Math.pow(Math.random(), 0.5) * 3.7 * (Math.random() - 0.5));
		boxMesh.position.setY((Math.random() - 0.5) * 10.0);
		boxMesh.scale.set(
			0.85 * Math.random(),
			0.85 * Math.random(),
			0.85 * Math.random());
		boxMesh.rotateX(Math.random() * 3.14159 * 2.0);
		boxMesh.rotateY(Math.random() * 3.14159 * 2.0);
		boxMesh.rotateZ(Math.random() * 3.14159 * 2.0);

		var blackBoxMesh = new THREE.Mesh(boxGeometry, blackBoxMat);
		blackBoxMesh.position.setZ(2);
		blackBoxMesh.layers.set( OCCLUSION_LAYER );
		scene.add(blackBoxMesh);
		occludingMeshes.push(blackBoxMesh);
		blackBoxMesh.position.copy(boxMesh.position);
		blackBoxMesh.quaternion.copy(boxMesh.quaternion);
		blackBoxMesh.scale.copy(boxMesh.scale);
	}
}

function updateBoxPositions() {
 for (var i=0; i<BOX_COUNT; i++) {
 	var boxMesh = realMeshes[i];
 	var blackBoxMesh = occludingMeshes[i];

 	boxMesh.position.y += 0.0025;
 	if (boxMesh.position.y > 5.0) {
 		boxMesh.position.y = -5.0;
 		boxMesh.position.setX( Math.pow(Math.random(), 0.5) * 3.7 * (Math.random() - 0.5));
 		boxMesh.rotateX(Math.random() * 3.14159 * 2.0);
		boxMesh.rotateY(Math.random() * 3.14159 * 2.0);
		boxMesh.rotateZ(Math.random() * 3.14159 * 2.0);
 		blackBoxMesh.quaternion.copy(boxMesh.quaternion);
 	}
 	blackBoxMesh.position.copy(boxMesh.position);
	// blackBoxMesh.quaternion.copy(boxMesh.quaternion);
 }
}

function resetBoxes() {

}

function render() {
		uniforms.u_time.value += 0.05;
		blurPasses.forEach(function (p) {
			p.uniforms.u_time.value += 0.05;
		});
		camera.layers.set(OCCLUSION_LAYER);
		renderer.setClearColor(0x000000);
		occlusionComposer.render();

		camera.layers.set(DEFAULT_LAYER);
		composer.render();
}
