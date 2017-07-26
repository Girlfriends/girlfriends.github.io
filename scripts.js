// Only executed our code once the DOM is ready.
window.onload = function() {

		// Get a reference to the canvas object
		var canvas = document.getElementById('canvas');
		// Create an empty project and a view for the canvas:
		paper.setup(canvas);

		var scale = 150;
		var pointsWeLike = [
		1.89775551077434,1,
		1.7266193254048,1.25274955997126,
		1.53658310369802,1.44505491709646,
		1.25265651591108,1.56111959031226,
		1.07601025373956,1.29696666450422,
		0.81527482676718,1.15211570241991,
		0.88519445417767,0.86841455256419,
		0.98866073233441,0.60222661400511,
		1.26730587529692,0.54076894222485,
		1.57133940591766,0.47883939690358,
		1.73282550131346,0.7432619729548
		];

		pointsWeLike.forEach(function(point, index, points) {
			points[index] = point*scale;
		});

		var rootSpeed = 0.02;
		var speedOffset = 0;
		var speed = rootSpeed + speedOffset;
		var radius = 60;
		var width, height, center;
		var points = 11;
		var phases;
		var smooth = true;
		var path = new paper.Path();
		var myText;
		var mousePos = {
			x: paper.view.center.x,
			y: paper.view.center.y
		};
		var pathHeight = mousePos.y;
		var tool = new paper.Tool();
		var isFindingPointsWeLike = false;
		path.fillColor = 'black';
		var interp = 0;
		var wigglePoints = [];
		initializePath();

		function initializePath() {
			center = paper.view.center;
			width = paper.view.size.width;
			height = paper.view.size.height;
			path.segments = [];
			phases = [];

			for (var i=0; i<points; i++) {
				var angle = Math.PI * 2 * (i/points);
				var x = center.x + Math.cos(angle) * radius;
				var y = center.y + Math.sin(angle) * radius;
				var point = new paper.Point(x, y);
				path.add(point);
				phases.push( (i + i % 4) * 100 );
				wigglePoints.push(0);
				wigglePoints.push(0);
			}

			path.closed = true;
			path.fullySelected = false;

			var pointTextLocation = center;
			if (!myText) myText = new paper.PointText(pointTextLocation);
			myText.fillColor = '#FCE5D5';
			myText.content = 'GL';
			myText.fontSize = '40px';
			myText.fontFamily = 'GT America Expanded';
			myText.fontWeight = '800';
			myText.position.x -= myText.bounds.width/2;
			myText.position.y += myText.bounds.height/4;
		}

		function animateDriftToNicePoints(event) {
			for (var i = 0; i < points; i++) {
				path.segments[i].point.x = interp * pointsWeLike[i*2] + (1 - interp) * wigglePoints[i*2];
				path.segments[i].point.y = interp * pointsWeLike[i*2+1] + (1 - interp) * wigglePoints[i*2+1];
			}
		}

		function animateWiggle(event) {
			speed = (rootSpeed + speedOffset);
			speedOffset *= 0.95;
			pathHeight += (Math.abs(center.y - mousePos.y) + (speed - rootSpeed) * 1000 - pathHeight) / 10;

			for (var i = 0; i < points; i++) {
				phases[i] += speed * 1;
				var sinHeight = Math.sin(phases[i]) * pathHeight;
				var delta = Math.sin(phases[i] + Math.sin(phases[i]) + (i * event.count) / 100) * sinHeight;
				delta *= 0.2;

				var angle = Math.PI * 2 * (i/points);
				var x = center.x + Math.cos(angle) * (radius + delta);
				var y = center.y + Math.sin(angle) * (radius + delta);

				wigglePoints[2*i] = x;
				wigglePoints[2*i+1] = y;
			}
			if (smooth)
				path.smooth({ type: 'continuous' });
		}

		function positionText() {
			var cx = 0;
			var cy = 0;

			for (var i = 0; i < points; i++) {
				cx += path.segments[i].point.x;
				cy += path.segments[i].point.y;
			}

			cx /= points;
			cy /= points;

			myText.matrix.reset();

			var mouseNorm = Object.assign({}, mousePos);
			mouseNorm.x = (2 * mousePos.x / width - 1);
			mouseNorm.y = (2 * mousePos.y / height - 1);

			var skewDegrees = {
				x: (1 - interp) * (-mouseNorm.x * (mouseNorm.y * 20)),
				y: (1 - interp) * (mouseNorm.x * (-(mouseNorm.y * mouseNorm.y) * 20))
			};

			myText.skew(skewDegrees);
			myText.scale(1.0 - (speed - rootSpeed));

			myText.position.x = cx;
			myText.position.y = cy;
		}

		paper.view.onFrame = function(event) {
			interp = interp * 0.95 + (isFindingPointsWeLike ? 0.05 : 0.0);

			animateWiggle(event);
			animateDriftToNicePoints(event);
			positionText();
		}

		tool.onMouseMove = function(event) {
			mousePos.x = (mousePos.x + event.point.x) / 2;
			mousePos.y = (mousePos.y + event.point.y) / 2;
		}

		tool.onMouseDown = function(event) {
			// smooth = !smooth;
			// if (!smooth) {
			// 	// If smooth has been turned off, we need to reset
			// 	// the handles of the path:
			// 	for (var i = 0, l = path.segments.length; i < l; i++) {
			// 		var segment = path.segments[i];
			// 		segment.handleIn = segment.handleOut = null;
			// 	}
			// }

			var p = path;

			var dx = mousePos.x - center.x;
			var dy = mousePos.y - center.y;
			var dist = Math.sqrt(dx*dx + dy*dy);

			speedOffset = 0.5 / (dist/100 + 1);
		}

		paper.view.onMouseEnter = function(event) {
			isFindingPointsWeLike = false;
			console.log("Tracking the mouse");
		}

		paper.view.onMouseLeave = function(event) {
			isFindingPointsWeLike = true;
			console.log("Returning to points we like");
		}

		// Reposition the path whenever the window is resized:
		function onResize(event) {
			initializePath();
		}
	}