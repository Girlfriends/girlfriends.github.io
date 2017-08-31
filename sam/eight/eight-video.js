var container;
var backgroundCamera, backgroundScene;
var foregroundCamera, foregroundScene;
var uniforms;

var paraGeo, paraMesh;
var paraGeo2, paraMesh2;
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

function parametricSurfaceFunc(u, v) {
	var nu = u * 2 - 1 + uniforms.u_time.value * 0.003 + Math.sin(uniforms.u_time.value) * 0.003;
	var nv = v * 2 - 1 + uniforms.u_time.value * 0.0023;
	var a = Math.sin(nu * 10.0 + uniforms.u_time.value * 0.02) * 2.0;
	var b = Math.sin(nv * 8.0 + uniforms.u_time.value * 0.04) * 2.0;
	var d = Math.sin(
		a * Math.sin(uniforms.u_time.value * 0.043) * 2.0 * Math.cos(uniforms.u_time.value * 0.3 + 0.5)
		+ uniforms.u_time.value * 0.4 * Math.pow(Math.cos(Math.sin(1) * 0.5), 3.0)
	);
	return new THREE.Vector3(a, b, b * d);
}

function initForegroundScene() {
	foregroundCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 50 );
	foregroundCamera.position.z = 10;
	foregroundCamera.up.set( 0, 1, 0 );
	foregroundCamera.lookAt(new THREE.Vector3(0, 0, 0));

	foregroundScene = new THREE.Scene();

	paraGeo = new THREE.ParametricGeometry(parametricSurfaceFunc, 8, 8);
	var paraMat = new THREE.MeshStandardMaterial({
		color: 0xee00ff
	});
	paraMat.side = THREE.DoubleSide;

	paraGeo2 = new THREE.ParametricGeometry(parametricSurfaceFunc, 8, 8);
	var paraMat2 = new THREE.MeshStandardMaterial({
		color: 0x8811ff
	});
	paraMat2.side = THREE.DoubleSide;

	paraMesh = new THREE.Mesh(paraGeo, paraMat);
	paraMesh2 = new THREE.Mesh(paraGeo2, paraMat2);
	paraMesh.rotateZ(Math.PI * 6 / 4);
	paraMesh2.rotateZ(Math.PI * 3 / 4);

	foregroundScene.add(paraMesh);
	foregroundScene.add(paraMesh2);

	var light = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light.position.set(-0.5, 0.5, 0.4);
	foregroundScene.add(light);

	light2 = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light2.position.set(0.2, 0.9, 0.8);
	foregroundScene.add(light2);

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

function animate() {
		requestAnimationFrame( animate );
		render();
}

function render() {
		uniforms.u_time.value += 0.05;
		renderer.clear();
		renderer.render( backgroundScene, backgroundCamera );
		renderer.clearDepth();
		// var nextGeo = new THREE.ParametricGeometry(parametricSurfaceFunc, 12, 12);
		for (var i=0; i<paraMesh.geometry.vertices.length; i++) {
			var u = (i) / 12;
			var v = (i % 12) / 12;
			var vec = parametricSurfaceFunc(u, v);
			paraMesh.geometry.vertices[i].copy(vec);
			vec.setZ(Math.pow(Math.abs(Math.cos(Math.sin(uniforms.u_time.value * 0.5))), 2.0) * 0.5);
			paraMesh2.geometry.vertices[i].copy(vec);
		}
		paraMesh.scale.set(Math.sin(uniforms.u_time.value * 0.042)* 0.2 + 1, 1, 1);
		// paraMesh.rotateX(0.0001);
		// paraMesh.rotateY(0.0001);
		// paraMesh2.rotateX(Math.sin(uniforms.u_time.value * 2) * 0.001);
		paraMesh.rotateZ(0.0005 * Math.sin(uniforms.u_time.value));
		paraMesh.material.color.setRGB(Math.abs(Math.sin(uniforms.u_time.value * 0.37)) * 0.2 + 0.8, 0.1, 1.0);
		paraMesh2.material.color.setRGB(Math.abs(Math.sin(uniforms.u_time.value * 0.23)) * 0.5 + 0.5, 0.2, 0.9);
		// paraMesh.geometry = nextMesh;
		paraGeo.verticesNeedUpdate = true;
		paraGeo2.verticesNeedUpdate = true;
		renderer.render( foregroundScene, foregroundCamera );
}
