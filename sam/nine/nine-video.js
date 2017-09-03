var container;
var backgroundCamera, backgroundScene;
var foregroundCamera, foregroundScene;
var uniforms;

var cubeParentGroup;
var bigCubeGroup;
var cubeFaces = [];
var cubeFlaps = [];
var frontFlapGroup;
var backFlapGroup;
var leftFlapGroup;
var rightFlapGroup;
var readyToOpen = false;

var flyingCubeMeshes = [];
var flyingCubeVelocities = [];
var flyingCubeRotations = [];
var flyingCubeCount = 450;
var animateFlyingCubes = false;
var airDamp = 0.97;

var bigCubePurpleness = 0;
var bigCubeVelocity = 0;
var bigCubeImpulse = 0;
var bigCubeK = 0.05;
var bigCubeDamping = 0.85;
var bigCubeRestingPoint = 0;

var CUBE_ROTATION_RATE = 0.003;
var FLAP_ROTATION_RATE = 0.25;

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
		renderer.shadowMap.enabled = true;
		// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

function doLaunch() {
	bigCubeImpulse = -0.4;
	setTimeout(function() {
		resetFlyingCubes();
		launchFlyingCubes()
	}, 150);
}

function createBoxFaces() {
	bigCubeGroup = new THREE.Group();
	cubeParentGroup.add(bigCubeGroup);

	var cubeFaceGeo = new THREE.PlaneBufferGeometry(1, 1);
	var cubeFaceMat = new THREE.MeshStandardMaterial({
		color: 0xaa00ff,
		side: THREE.DoubleSide
	});

	// Create the five faces of the cube
	var bottomFaceMesh = new THREE.Mesh(cubeFaceGeo, cubeFaceMat);
	bottomFaceMesh.rotateX(-Math.PI / 2);
	bottomFaceMesh.position.set(0, -0.5, 0);
	bigCubeGroup.add(bottomFaceMesh);
	cubeFaces.push(bottomFaceMesh);

	var backFaceMesh = new THREE.Mesh(cubeFaceGeo, cubeFaceMat);
	backFaceMesh.position.set(0, 0, -0.5);
	backFaceMesh.rotateY(Math.PI);
	bigCubeGroup.add(backFaceMesh);
	cubeFaces.push(backFaceMesh);

	var frontFaceMesh = new THREE.Mesh(cubeFaceGeo, cubeFaceMat);
	frontFaceMesh.position.set(0, 0, 0.5);
	bigCubeGroup.add(frontFaceMesh);
	cubeFaces.push(frontFaceMesh);

	var rightFaceMesh = new THREE.Mesh(cubeFaceGeo, cubeFaceMat);
	rightFaceMesh.rotateY(Math.PI / 2);
	rightFaceMesh.position.set(0.5, 0.0, 0);
	bigCubeGroup.add(rightFaceMesh);
	cubeFaces.push(rightFaceMesh);

	var leftFaceMesh = new THREE.Mesh(cubeFaceGeo, cubeFaceMat);
	leftFaceMesh.rotateY(-Math.PI / 2);
	leftFaceMesh.position.set(-0.5, 0.0, 0);
	bigCubeGroup.add(leftFaceMesh);
	cubeFaces.push(leftFaceMesh);

	cubeFaces.forEach(function (obj) {
		obj.receiveShadow = true;
		obj.castShadow = true;
	});
}

function createBoxTop() {
	var cubeFaceGeo = new THREE.PlaneBufferGeometry(1, 1);
	var cubeFaceMat = new THREE.MeshStandardMaterial({
		color: 0xaa00ff,
		side: THREE.DoubleSide
	});

	var flapMesh = new THREE.Mesh(cubeFaceGeo, cubeFaceMat);
	flapMesh.scale.set(1, 0.333, 1);
	flapMesh.rotateX(Math.PI / 2);
	flapMesh.position.set(0, 0, -0.1666);
	flapMesh.castShadow = true;
	frontFlapGroup = new THREE.Group();
	frontFlapGroup.position.set(0, 0.5, 0.5);
	frontFlapGroup.add(flapMesh);
	bigCubeGroup.add(frontFlapGroup);
	cubeFlaps.push(flapMesh);

	flapMesh = new THREE.Mesh(cubeFaceGeo, cubeFaceMat);
	flapMesh.scale.set(1, 0.333, 1);
	flapMesh.rotateX(Math.PI / 2);
	flapMesh.position.set(0, 0, 0.1666);
	flapMesh.castShadow = true;
	backFlapGroup = new THREE.Group();
	backFlapGroup.position.set(0, 0.5, -0.5);
	backFlapGroup.add(flapMesh);
	// backFlapGroup.rotateX(1.0);
	bigCubeGroup.add(backFlapGroup);
	cubeFlaps.push(flapMesh);

	flapMesh = new THREE.Mesh(cubeFaceGeo, cubeFaceMat);
	flapMesh.scale.set(0.333, 1., 1);
	flapMesh.rotateX(Math.PI / 2);
	flapMesh.position.set(0.1666, 0, 0);
	flapMesh.castShadow = true;
	leftFlapGroup = new THREE.Group();
	leftFlapGroup.position.set(-0.5, 0.5, 0);
	leftFlapGroup.add(flapMesh);
	// leftFlapGroup.rotateZ(-0.5);
	bigCubeGroup.add(leftFlapGroup);
	cubeFlaps.push(flapMesh);

	flapMesh = new THREE.Mesh(cubeFaceGeo, cubeFaceMat);
	flapMesh.scale.set(0.333, 1., 1);
	flapMesh.rotateX(Math.PI / 2);
	flapMesh.position.set(0.1666, 0, 0);
	flapMesh.castShadow = true;
	rightFlapGroup = new THREE.Group();
	rightFlapGroup.position.set(0.5, 0.5, 0);
	rightFlapGroup.add(flapMesh);
	rightFlapGroup.rotateZ(Math.PI);
	bigCubeGroup.add(rightFlapGroup);
	cubeFlaps.push(flapMesh);
}

function initFlyingCubes() {
	var cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
	var cubeMat = new THREE.MeshPhongMaterial({
		color:0xaa00ff,
		transparent: true
	});
	for (var i=0; i<flyingCubeCount; i++) {
		var cubeMesh = new THREE.Mesh(cubeGeometry, cubeMat);
		cubeMesh.position.set(0, -1000, 0);
		cubeMesh.scale.set(0.1, 0.1, 0.1);
		flyingCubeMeshes.push(cubeMesh);
		cubeParentGroup.add(cubeMesh);
	}
}

function resetFlyingCubes() {
	flyingCubeVelocities = [];
	flyingCubeRotations = [];
	flyingCubeMeshes.forEach(function (cube, idx) {
		var scale = Math.random() * 0.08 + 0.02;
		flyingCubeVelocities.push(new THREE.Vector3(0, 0, 0));
		flyingCubeRotations.push(new THREE.Vector3(0, 0, 0));
		cube.position.set(0, -0.65, 0);
		cube.material.opacity = 1;
		cube.scale.set(scale, scale, scale);
		cube.rotateX(Math.random() * 2 * Math.PI);
		cube.rotateY(Math.random() * 2 * Math.PI);
		cube.rotateZ(Math.random() * 2 * Math.PI);
	});
}

function launchFlyingCubes() {
	setTimeout(playChord, 120);
	animateFlyingCubes = true;
	flyingCubeMeshes[0].material.color.setHSL(Math.random() * 0.06 + 0.72, 1.0, 0.5);
	flyingCubeMeshes.forEach(function (cube, idx) {
		var randomVel = Math.pow((Math.sqrt(Math.random())) + 0.1, 8.0) * 0.05;
		var rangle = Math.random() * Math.PI * 2.0;
		flyingCubeVelocities[idx].set(
			randomVel * Math.sin(rangle) * 0.5 + (Math.random() - 0.5) * 0.02,
			randomVel * 0.5 + (Math.random() - 0.5) * 0.03 + 0.06,
			randomVel * Math.cos(rangle) * 0.5 + (Math.random() - 0.5) * 0.02
		);
		flyingCubeRotations[idx].set(
			(Math.random() - 0.5) * 1.0,
			(Math.random() - 0.5) * 1.0,
			(Math.random() - 0.5) * 1.0
		);
	});
}

function updateFlyingCubes() {
	if (animateFlyingCubes) {
		flyingCubeMeshes[0].material.opacity -= 0.005;
		flyingCubeMeshes.forEach(function (cube, idx) {
			cube.position.set(
				cube.position.x + flyingCubeVelocities[idx].x,
				cube.position.y + flyingCubeVelocities[idx].y,
				cube.position.z + flyingCubeVelocities[idx].z
			);
			cube.rotateX(flyingCubeRotations[idx].x);
			cube.rotateY(flyingCubeRotations[idx].y);
			cube.rotateZ(flyingCubeRotations[idx].z);

			flyingCubeVelocities[idx].x *= airDamp;
			flyingCubeVelocities[idx].y -= 0.0001;
			flyingCubeVelocities[idx].y *= airDamp;
			flyingCubeVelocities[idx].z *= airDamp;
			flyingCubeRotations[idx].x *= airDamp;
			flyingCubeRotations[idx].y *= airDamp;
			flyingCubeRotations[idx].z *= airDamp;
		});
	}
}

function updateBigCube() {
	bigCubeVelocity += bigCubeImpulse;
	bigCubeImpulse = Math.max(0, bigCubeImpulse - 0.05);
	bigCubeGroup.position.y += bigCubeVelocity;
	var cubeScale = 0.8 + Math.abs(bigCubeGroup.position.y);
	cubeFaces.forEach(function (mesh) {
		mesh.material.color.setHSL(0.76, bigCubePurpleness, 0.5);
	});
	cubeFlaps.forEach(function (mesh) {
		mesh.material.color.setHSL(0.76, bigCubePurpleness, 0.5);
	});
	bigCubeGroup.scale.set(cubeScale, cubeScale, cubeScale);
	bigCubeVelocity += ((bigCubeRestingPoint - bigCubeGroup.position.y) * bigCubeK);
	bigCubeVelocity *= bigCubeDamping;
}

function initForegroundScene() {
	foregroundCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 50 );
	foregroundCamera.position.y = 2;
	foregroundCamera.position.z = 10;
	foregroundCamera.up.set( 0, 1, 0 );
	foregroundCamera.lookAt(new THREE.Vector3(0, 2, 0));

	foregroundScene = new THREE.Scene();

	cubeParentGroup = new THREE.Group();
	foregroundScene.add(cubeParentGroup);

	createBoxFaces();
	createBoxTop();

	var light = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light.position.set(-0.5, 0.5, 0.4);
	light.castShadow = true;
	foregroundScene.add(light);

	light2 = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light2.position.set(0.2, 0.9, 0.8);
	light2.castShadow = false;
	foregroundScene.add(light2);

	var otherLight = new THREE.AmbientLight(0xffffff, 0.3 );
	foregroundScene.add(otherLight);

	cubeParentGroup.scale.set(2, 2, 2);
	bigCubeGroup.scale.set(1.5, 1.5, 1.5);
	cubeParentGroup.rotateY(Math.PI / 4);

	initFlyingCubes();
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
		uniforms.u_time.value += 0.016666;
		renderer.clear();
		renderer.render( backgroundScene, backgroundCamera );
		renderer.clearDepth();
		renderer.render( foregroundScene, foregroundCamera );

		var angle = uniforms.u_time.value * FLAP_ROTATION_RATE * Math.PI * 2;
		var dangle = 0.016666 * 2 * Math.PI * FLAP_ROTATION_RATE;

		var nextReadyToOpen = ((angle) % (2 * Math.PI) > (Math.PI + 1.0));
		if (nextReadyToOpen && !readyToOpen) {
			doLaunch();
		}

		if (!nextReadyToOpen) {
			bigCubePurpleness += 0.005
		} else {
			bigCubePurpleness *= 0.97;
		}
		bigCubePurpleness = Math.min(bigCubePurpleness, 1.0);

		readyToOpen = nextReadyToOpen;

		frontFlapGroup.rotateX(dangle);
		backFlapGroup.rotateX(-dangle);
		leftFlapGroup.rotateZ(dangle);
		rightFlapGroup.rotateZ(-dangle);

		// bigCubeGroup.position.set(
		// 	0,
		// 	Math.sin(uniforms.u_time.value * 0.5) * 0.2,
		// 	0
		// );

		bigCubeGroup.rotateY(CUBE_ROTATION_RATE);

		updateFlyingCubes();
		updateBigCube();
}
