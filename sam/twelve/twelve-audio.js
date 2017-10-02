var trackedPointers = {};

var synth = new Tone.FMSynth({
	"modulationIndex" : 2.,
	"harmonicity": 4.,
	"envelope" : {
		"attack" : 0.01,
		"decay" : 0.2
	},
	"modulation" : {
		"type" : "square"
	},
	"modulationEnvelope" : {
		"attack" : 0.08,
		"decay" : 0.1
	},
	"volume": -12
});

var synth2 = new Tone.FMSynth({
	"modulationIndex" : 2.,
	"harmonicity": 3.0,
	"envelope" : {
		"attack" : 0.01,
		"decay" : 0.2
	},
	"modulation" : {
		"type" : "square"
	},
	"modulationEnvelope" : {
		"attack" : 0.04,
		"decay" : 0.1
	}
});

var synth3 = new Tone.FMSynth({
	"modulationIndex" : 3.,
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

synth.toMaster();
synth2.toMaster();
synth3.toMaster();

var steadyPattern2 = new Tone.Pattern(function(time, note){
  //the order of the notes passed in depends on the pattern
  synth2.triggerAttackRelease(note, "16n", time);
},
	[
		"B3", "C#4", "E4", "C#4", "G#4", "A4",
		"B3", "C#4", "E4", "C#4", "G#4", "A4",
		"B3", "C#4", "E4", "C#4", "G#4", "A4",
		"B3", "C#4", "E4", "C#4", "G#4", "A4",
		"A3", "C#4", "E4", "C#4", "B4", "A4",
		"A3", "C#4", "E4", "C#4", "B4", "A4",
		"A3", "C#4", "E4", "C#4", "B4", "A4",
		"A3", "C#4", "E4", "C#4", "B4", "A4",
	], "up");
steadyPattern2.interval = "16n";
steadyPattern2.start("4n");

var steadyPattern = new Tone.Pattern(function(time, note) {
	synth.triggerAttackRelease(note, "4n", time);
}, [
	"B5", "F#5", "B5", "F#5",
	"A5", "F#5", "A5", "F#5",
], "up");
steadyPattern.interval = "8n";
steadyPattern.start("4n");

var steadyPattern3 = new Tone.Pattern(function(time, note) {
	synth3.triggerAttackRelease(note, "4n", time);
}, [
	"B3", "B3", "B3", "B3",
	"A3", "A3", "A3", "A3",
], "up");
steadyPattern3.interval = "2n";
steadyPattern3.start("4n");

Tone.Transport.bpm.value = 120;
Tone.Transport.start();