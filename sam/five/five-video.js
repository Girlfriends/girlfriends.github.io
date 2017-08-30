var container;
var backgroundCamera, backgroundScene;
var foregroundCamera, foregroundScene;
var uniforms;
var rainyRects = [];
var rectCount = 1000;
var rectVelocitiesX = [];
var rectVelocitiesY = [];
var layers = 20;
var windVelocities = [];
var windModulations = [];
var windVelocity = 0;

init();
animate();

function init() {
		container = document.getElementById( 'container' );

		uniforms = {
				u_time: { type: "f", value: 1.0 },
				u_resolution: { type: "v2", value: new THREE.Vector2() },
				u_mouse: { type: "v2", value: new THREE.Vector2() }
		};

		// initBackgroundScene();
		initForegroundScene();

		renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		renderer.setPixelRatio( window.devicePixelRatio );

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

function resetRectMesh(mesh, idx) {
	var m = Math.sqrt(Math.random());
	var z = -m * layers;
	var xRange = Math.tan(Math.PI / 8) * 2 * (10 - z);
	var x = (Math.random() - 0.5) * xRange;
	var y = xRange / 2 + Math.random() * xRange * 1;
	mesh.position.set(x, y, z);
	mesh.material.color.setRGB(0, Math.random() * 0.1, Math.random() * 0.9 + 0.1);
	rectVelocitiesY[idx] *= Math.random() * 0.75;
}

function initForegroundScene() {
	foregroundCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
	foregroundCamera.position.z = 10;
	foregroundCamera.up.set( 0, 1, 0 );
	foregroundCamera.lookAt(new THREE.Vector3(0, 0, 0));

	foregroundScene = new THREE.Scene();

	for (var j = 0; j<layers; j++) {
		windVelocities.push(0);
		windModulations.push(Math.random());
	}

	for (var i=0; i<rectCount; i++) {
		var geometry = new THREE.PlaneBufferGeometry(1, 1);

		var material = new THREE.MeshBasicMaterial({
			color: 0x0000ff
		});

		var c = ((((i % 5) / 5) - 0.5) * 2) * 3;
		var r = (((Math.floor(i / 5) / 5) - 0.5) * 2) * 3;

		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.set(c, r, 0);
		foregroundScene.add( mesh );
		rainyRects.push(mesh);
		rectVelocitiesX.push(0);
		rectVelocitiesY.push(0);
	}

	rainyRects.forEach(function (mesh, idx) {
		resetRectMesh(mesh, idx);
	});
}

function onWindowResize( event ) {
		renderer.setSize( window.innerWidth, window.innerHeight );
		foregroundCamera.aspect =  window.innerWidth / window.innerHeight ;
		foregroundCamera.updateProjectionMatrix();
		uniforms.u_resolution.value.x = renderer.domElement.width;
		uniforms.u_resolution.value.y = renderer.domElement.height;
}

function updateOffscreenSquares() {
	rainyRects.forEach(function (mesh, idx) {
		var vel = rectVelocitiesY[idx];
		var yMax = Math.tan(Math.PI / 8) * 2 * Math.abs(10 - mesh.position.z);
		var layer = Math.abs(Math.floor(mesh.position.z));
		if (mesh.position.y < (-yMax / 2 - 1)) {
			resetRectMesh(mesh, idx);
		}
		mesh.position.setX(mesh.position.x + rectVelocitiesX[idx]);
		mesh.position.setY(mesh.position.y + vel);
		rectVelocitiesY[idx] += -0.0001;
		rectVelocitiesX[idx] += 0.001 * (windVelocities[layer] - rectVelocitiesX[idx]);
	});
}

function animate() {
		requestAnimationFrame( animate );
		updateOffscreenSquares();
		for (var i=0; i<layers; i++) {
			windVelocities[i] = 0.01 * Math.sin(uniforms.u_time.value * windModulations[i] * 0.1 + windModulations[i] * 10);
		}
		render();
}

function render() {
		uniforms.u_time.value += 0.05;
		renderer.render( foregroundScene, foregroundCamera );
}
