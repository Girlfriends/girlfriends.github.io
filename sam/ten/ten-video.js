var container;
var backgroundCamera, backgroundScene;
var foregroundCamera, foregroundScene;
var uniforms;

var bigGrayCube;
var bigCubeAngle = 0;
var bigCubeGroup;
var cubeCount = 400;
var miniCubes = [];

var CUBE_SIZE = 2;

var zOffsetRange = [-0.2, 0.2];
var colorHueRange = [0.93, 1.01];
var colorSaturationRange = [0.9, 1.0];
var colorBrightnessRange = [0.5, 0.6];
var sizeChoices = [15, 16, 17, 18, 19, 20];
var rotationRateRange = [0.03, 0.24];

function randomFromRange(range) {
	var r = range[1] - range[0];
	return range[0] + r * Math.random();
}

function randomFromSet(set) {
	return set[Math.floor(Math.random() * set.length)];
}

function createRandomCube(doRed, doRotate, hardOffset) {
	var color = new THREE.Color();
	color.setHSL(
		randomFromRange(colorHueRange),
		doRed ? randomFromRange(colorSaturationRange) : 0,
		randomFromRange(colorBrightnessRange)
	);
	var sizeIndex = randomFromSet(sizeChoices);
	var rotationRate = randomFromRange(rotationRateRange);
	var zOffset = randomFromRange(zOffsetRange);
	return new Cube(color, sizeIndex, rotationRate, zOffset + hardOffset, doRotate);
}

function Cube (color, sizeIndex, rotationRate, zOffset, rotateY) {
	this.color = color;
	this.sizeIndex = sizeIndex;
	this.size = CUBE_SIZE / sizeIndex;
	this.rotationRate = rotationRate;
	this.stepIndex = 0;
	this.angle = Math.random() * (Math.PI/2 - 0.001);
	this.zOffset = zOffset;
	this.rotateY = rotateY;
}

Cube.prototype.init = function() {
	var miniCubeGeo = new THREE.BoxBufferGeometry(1, 1, 1);
	var miniCubeMat = new THREE.MeshStandardMaterial({
		color: this.color,
		roughness: 0.8
	});
	miniCubeMat.castShadow = true;
	this.cubeMesh = new THREE.Mesh(miniCubeGeo, miniCubeMat);
	this.cubeMesh.castShadow = true;
	this.cubeMesh.scale.set(this.size, this.size, this.size);
	this.cubeGroup = new THREE.Group();
	this.cubeGroup.add(this.cubeMesh);
	if (this.rotateY) {
		this.cubeGroup.rotateY(Math.PI);
		this.cubeGroup.position.set(0, 0, -this.zOffset);
	} else {
		this.cubeGroup.position.set(0, 0, this.zOffset);
	}
	bigCubeGroup.add(this.cubeGroup);
}

Cube.prototype.update = function() {
	this.angle += this.rotationRate;
	this.cubeMesh.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), -this.angle);

	var maxRot = this.stepIndex === this.sizeIndex - 1 ? Math.PI : Math.PI/2;

	if (this.angle >= maxRot) {
		this.angle = 0;
		this.stepIndex += 1;
		if (this.stepIndex === this.sizeIndex) {
			this.stepIndex = 0;
			this.cubeGroup.rotateZ(-Math.PI/2);
		}
	}

	var sx = (-CUBE_SIZE/2) + (this.stepIndex + 1) * this.size;

	var r = Math.sqrt(2) * (this.size/2);
	var x = r * Math.sin(-Math.PI/4 + this.angle);
	var y = r * Math.cos(-Math.PI/4 + this.angle);

	this.cubeMesh.position.set(sx + x, y + CUBE_SIZE/2, 0);
}

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
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
	foregroundCamera.position.y = 1;
	foregroundCamera.position.z = 10;
	foregroundCamera.up.set( 0, 1, 0 );
	foregroundCamera.lookAt(new THREE.Vector3(0, 0, 0));

	foregroundScene = new THREE.Scene();

	var cubeGeo = new THREE.BoxBufferGeometry(1, 1, 1);
	var cubeMat2 = new THREE.MeshStandardMaterial({
		color: 0xffffff,
		roughness: 0.8,
		transparent: true,
		opacity: 0.5
	});

	bigGrayCube = new THREE.Mesh(cubeGeo, cubeMat2);
	bigGrayCube.receiveShadow = true;
	bigGrayCube.position.set(0, 0, 0);
	bigGrayCube.scale.set(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
	bigCubeGroup = new THREE.Group();
	bigCubeGroup.scale.set(1.2, 1.2, 1.2);
	bigCubeGroup.add(bigGrayCube);
	foregroundScene.add(bigCubeGroup);

	for (var i=0; i<cubeCount; i++) {
		var redBand = i%3===1;
		var miniCube = createRandomCube(!redBand, !redBand, (i%3-1) * 0.55);
		miniCube.init();
		miniCubes.push(miniCube);
	}

	var light = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light.position.set(0.0, 20, 10);
	light.castShadow = true;
	light.target.position.set(0, 0, 0);
	light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 10, 2500 ) );
	light.shadow.bias = 0.0001;
	light.shadow.mapSize.width = 2048;
	light.shadow.mapSize.height = 1024;
	foregroundScene.add(light);

	light2 = new THREE.DirectionalLight( 0xffeeee, 0.7 );
	light2.position.set(-10, 20, 5);
	light2.castShadow = true;
	light2.target.position.set(0, 0, 0);
	light2.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 10, 2500 ) );
	light2.shadow.bias = 0.0001;
	light2.shadow.mapSize.width = 2048;
	light2.shadow.mapSize.height = 1024;
	foregroundScene.add(light2);

	var otherLight = new THREE.AmbientLight(0xffffee, 0.3 );
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

		miniCubes.forEach(function (cube) { cube.update() });

		bigCubeGroup.rotateX(0.0067 * Math.sin(uniforms.u_time.value / 10));
		bigCubeGroup.rotateY(-0.0037);
		bigCubeGroup.rotateZ(0.0022);
		bigGrayCube.material.color.setHSL(
			0.92,
			(Math.sin(uniforms.u_time.value * 2) + 1) * 0.1,
			0.9
		);

		renderer.clear();
		renderer.render( backgroundScene, backgroundCamera );
		renderer.clearDepth();
		renderer.render( foregroundScene, foregroundCamera );
}
