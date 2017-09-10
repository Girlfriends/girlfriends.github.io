var trackedPointers = {};

var synth = new Tone.FMSynth({
	"modulationIndex" : 12.22,
	"harmonicity": 4.5,
	"envelope" : {
		"attack" : 0.01,
		"decay" : 0.2
	},
	"modulation" : {
		"type" : "square"
	},
	"modulationEnvelope" : {
		"attack" : 0.0,
		"decay" : 0.01
	}
});

var synth2 = new Tone.FMSynth({
	"modulationIndex" : 12.22,
	"harmonicity": 5.6,
	"envelope" : {
		"attack" : 0.01,
		"decay" : 0.2
	},
	"modulation" : {
		"type" : "sine"
	},
	"modulationEnvelope" : {
		"attack" : 0.0,
		"decay" : 0.01
	}
});

var synth3 = new Tone.FMSynth({
	"modulationIndex" : 12.22,
	"harmonicity": 4,
	"envelope" : {
		"attack" : 0.01,
		"decay" : 0.2
	},
	"modulation" : {
		"type" : "square"
	},
	"modulationEnvelope" : {
		"attack" : 0.0,
		"decay" : 0.01
	}
});

var synth4 = new Tone.FMSynth({
	"modulationIndex" : 12.22,
	"harmonicity": 4,
	"envelope" : {
		"attack" : 0.01,
		"decay" : 0.2
	},
	"modulation" : {
		"type" : "sine"
	},
	"modulationEnvelope" : {
		"attack" : 0.0,
		"decay" : 0.01
	}
});

synth.triggerAttack(6);
synth2.triggerAttack(16);
synth3.triggerAttack(20);
synth4.triggerAttack(8);

var mult = new Tone.Multiply().toMaster();
synth.connect(mult, 0, 0);
synth2.connect(mult, 0, 1);
var mult2 = new Tone.Multiply().toMaster();
synth3.connect(mult2, 0, 0);
synth4.connect(mult2, 0, 1);

var fade = new Tone.CrossFade();
mult.connect(fade, 0, 0);
mult2.connect(fade, 0, 1);

var dist = new Tone.Distortion(0.3).toMaster();
var shift = new Tone.PitchShift (12);
var shift2 = new Tone.PitchShift (14);
fade.connect(shift, 0, 0);
fade.connect(shift2, 0, 0);
shift.connect(dist, 0, 0);
shift2.connect(dist, 0, 0);

function updateSynths(event) {
	var normX = event.pageX / window.innerWidth;
	var normY = event.pageY / window.innerHeight;

	synth2.frequency.rampTo(normY * 40.0 + 20.0, 0.005);
	synth.frequency.rampTo(normX * 10.0 + 4.0, 0.005);
	synth3.modulationIndex.rampTo(normY * 43.0 + 20.0, 0.005);
	synth4.frequency.rampTo((1 - normX) * 12.0 + 2.0, 0.005);

	fade.fade.rampTo(normX, 0.005);
}

document.onpointerdown = function(event) {
	trackedPointers[event.pointerId] = true;
	updateSynths(event);
}

document.onpointerup = function(event) {
	trackedPointers[event.pointerId] = false;
}

document.onpointerupoutside = function(event) {
	trackedPointers[event.pointerId] = false;
}

document.onpointercancel = function(event) {
	trackedPointers[event.pointerId] = false;
}

document.onpointermove = function(event) {
	if (!trackedPointers[event.pointerId]) return;
	updateSynths(event);
}

Tone.Transport.start();