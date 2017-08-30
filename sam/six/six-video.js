var container;
var backgroundCamera, backgroundScene;
var foregroundCamera, foregroundScene;
var uniforms;

var moonMesh;
var moonStartY = -1.;
var waveMeshes = [];
var rotationOffsets = [];

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
			antialias: true
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
	foregroundCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 50 );
	foregroundCamera.position.z = 10;
	foregroundCamera.up.set( 0, 1, 0 );
	foregroundCamera.lookAt(new THREE.Vector3(0, 0, 0));

	foregroundScene = new THREE.Scene();

	for (var i=0; i<7; i++) {
		var planeGeo = new THREE.PlaneBufferGeometry(2, 2);

		var material = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: document.getElementById( 'foregroundVertexShader' ).textContent,
			fragmentShader: document.getElementById( 'foregroundFragmentShader' ).textContent
		} );

		var mesh = new THREE.Mesh(planeGeo, material);

		mesh.position.set(0, -4 + i * 0.6, -i * 3);
		mesh.scale.set(100, 2, 1);

		foregroundScene.add(mesh);

		rotationOffsets.push(Math.random() * 6.28);
		waveMeshes.push(mesh);
	}

	var diskGeo = new THREE.SphereBufferGeometry( 5, 32, 32 );
	var diskMat = new THREE.MeshStandardMaterial({
		metalness: 0,
		roughness: 0.7,
		color: 0x9999aa
	});

	moonMesh = new THREE.Mesh(diskGeo, diskMat);
	moonMesh.scale.set(0.1, 0.1, 0.02);

	moonMesh.position.set(3.1, moonStartY, -8.5);
	foregroundScene.add(moonMesh);

	var light = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light.position.set(-0.5, 1.0, 0.4);
	foregroundScene.add(light);

	var otherLight = new THREE.AmbientLight(0xffffff, 0.3 );
	foregroundScene.add(otherLight);
}

function onWindowResize( event ) {
		renderer.setSize( window.innerWidth, window.innerHeight );
		foregroundCamera.aspect =  window.innerWidth / window.innerHeight ;
		foregroundCamera.updateProjectionMatrix();
		uniforms.u_resolution.value.x = renderer.domElement.width;
		uniforms.u_resolution.value.y = renderer.domElement.height;
}

function updateWaveRotations() {
	waveMeshes.forEach(function (mesh, idx) {
		var offset = rotationOffsets[idx];
		mesh.rotateZ(Math.sin(uniforms.u_time.value * 0.2 + offset) * 0.0003);
		mesh.rotateY(Math.sin(uniforms.u_time.value * 0.21 + offset) * 0.0003);
	});

	moonMesh.position.setY(Math.sin(uniforms.u_time.value * 0.2) * 0.1 + moonStartY)
}

function animate() {
		requestAnimationFrame( animate );
		updateWaveRotations();
		render();
}

function render() {
		uniforms.u_time.value += 0.05;
		renderer.clear();
		renderer.render( backgroundScene, backgroundCamera );
		renderer.clearDepth();
		renderer.render( foregroundScene, foregroundCamera );
}
