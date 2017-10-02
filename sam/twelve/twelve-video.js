var camera, scene, renderer;
var container;
var uniforms;
var controls, gui;
var rectangles = [];
var meshes = [];
var rectCount = 5000;

init();
makeControls();
makeRectangles();
animate();

function makeControls() {
	controls = {
		rad: 15,
		speed: 1.0,
		varX: 1.0,
	};

	// gui = new dat.GUI();
	// gui.add(controls, 'rad');
	// gui.add(controls, 'speed', -2, 2);
	// gui.add(controls, 'varX');
}

function scale(i, iMin, iMax, oMin, oMax) {
	var o = i / (iMax - iMin);
	o -= iMin;
	o *= (oMax - oMin);
	return o + oMin;
}

function Rectangle() {
	this.position = {
		x: scale(Math.random(), 0, 1, 0, 2.0 * Math.PI),
		y: scale(Math.random(), 0, 1, -Math.PI/2.0, Math.PI/2.0),
		z: 0.2
	};
	this.speed = {
		x: scale(Math.random(), 0, 1, -0.1, 0.1),
		y: scale(Math.random(), 0, 1, -0.02, 0.02),
		z: 0
	}
}

function makeRectangles() {
	var rectGeo = new THREE.PlaneBufferGeometry(0.2, 0.02, 5, 5);
	var rectMat = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: document.getElementById( 'vertexShader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
			side: THREE.DoubleSide,
	} );
	for (var i=0; i<rectCount; i++) {
		var rectMesh = new THREE.Mesh( rectGeo, rectMat );
		var rect = new Rectangle();
		rectMesh.position.set(rect.position.x, rect.position.y, rect.position.z);
		scene.add(rectMesh);
		meshes.push(rectMesh);
		rectangles.push(rect);
	}
}

function init() {
		container = document.getElementById( 'container' );

		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.y = 1;
		camera.position.z = 20;
		camera.up.set( 0, 1, 0 );
		camera.lookAt(new THREE.Vector3(0, 0, 0));

		scene = new THREE.Scene();

		uniforms = {
				u_time: { type: "f", value: 1.0 },
				u_resolution: { type: "v2", value: new THREE.Vector2() },
				u_mouse: { type: "v2", value: new THREE.Vector2() },
				u_angle: { type: "f", value: 0.0 },
				u_var_x: { type: "f", value: 0.0 },
		};

		var material = new THREE.ShaderMaterial( {
				uniforms: uniforms,
				vertexShader: document.getElementById( 'vertexShader' ).textContent,
				fragmentShader: document.getElementById( 'fragmentShader' ).textContent
		} );

		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );

		container.appendChild( renderer.domElement );

		onWindowResize();
		window.addEventListener( 'resize', onWindowResize, false );

		document.onmousemove = function(e){
			uniforms.u_mouse.value.x = e.pageX
			uniforms.u_mouse.value.y = e.pageY
		}
}

function onWindowResize( event ) {
		renderer.setSize( window.innerWidth, window.innerHeight );
		uniforms.u_resolution.value.x = renderer.domElement.width;
		uniforms.u_resolution.value.y = renderer.domElement.height;
}

function animate() {
		requestAnimationFrame( animate );
		render();
}

function render() {
	var inc = 0.05;
	uniforms.u_time.value += inc;
	uniforms.u_angle.value += controls.speed * inc;
	uniforms.u_var_x.value = controls.varX;
	var t = uniforms.u_time.value;

	rectangles.forEach(function (rect, idx) {
		var mesh = meshes[idx];
		rect.position.x += rect.speed.x * inc;
		rect.position.y += rect.speed.y * inc;
		if (rect.position.x > Math.PI * 2.0) rect.position.x = 0;
		if (rect.position.x < 0) rect.position.x = 2.0 * Math.PI;
		if (rect.position.y > Math.PI/2.0) rect.position.y = -Math.PI/2.0;
		if (rect.position.y < -Math.PI/2.0) rect.position.y = Math.PI/2.0;
		// rect.position.z = rect.position.x > Math.PI ? 1 : 0;
		rect.position.z = 2.0
			- (1.0 - Math.abs(Math.sin(rect.position.x + (Math.cos(t * 0.025)) + t * 0.03)))
			- (1.0 - Math.abs(Math.cos(rect.position.y + (Math.sin(t * 0.02)) + t * 0.05)))
		rect.position.z *= 2.0;
		rect.position.z = 1.0 + 0.01 * rect.position.z * rect.position.z * rect.position.z;
		mesh.position.set(rect.position.x, rect.position.y, rect.position.z);
		mesh.rotateZ(Math.sin((t + rect.position.x) / 10.0) / 4.0);
	});

	renderer.render( scene, camera );
}