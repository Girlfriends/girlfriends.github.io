var psynth = new Tone.PolySynth(12, Tone.FMSynth);
psynth.volume.value = -9;
psynth.set("harmonicity", 1.0);
psynth.set("modulationIndex", 1);
psynth.set({
	modulation: {
		type: "sine"
	},
	oscillator: {
		type: "sine"
	},
	envelope: {
		attack: 0.001,
		decay: 0.3,
		sustain: 0.2,
		release: 0.9
	}
});

var psynth2 = new Tone.PolySynth(4, Tone.FMSynth);
psynth2.volume.value = -6;
psynth2.set("harmonicity", 2);
psynth2.set("modulationIndex", 0.5);
psynth2.set({
	modulation: {
		type: "sine"
	},
	oscillator: {
		type: "sine"
	},
	envelope: {
		attack: 0.02,
		decay: 0.5,
		sustain: 0.1,
		release: 0.9
	}
});

var trem = new Tone.Tremolo(3, 0.5).toMaster().start();
var chorus = new Tone.Distortion(0.1);
var filt = new Tone.AutoFilter("2n").toMaster().start();
filt.wet.value = 0.8;
filt.filter.Q.value = 2;
psynth2.connect(trem);
trem.connect(chorus);
chorus.connect(filt);
var mid = 2;

var pan = new Tone.AutoPanner(1.2).toMaster().start()
pan.depth = 0.5;
psynth.connect(pan);

// psynth.connect(feedbackDelay);

var chordPattern = new Tone.CtrlPattern(
	[
		[60, 63, 67, 70],
		[58, 63, 67, 70],
		[56, 65, 67, 70],
		[56, 63, 67, 72]
	],
	"up"
);

var steadyPattern = new Tone.Pattern(function(time, note){
  //the order of the notes passed in depends on the pattern
  psynth.triggerAttackRelease(Tone.Frequency(note, "midi"), "8n", time);
}, [60, 60, 60, 60], "up");
steadyPattern.interval = "8n";

function playChord() {
	var vals = chordPattern.value;
	vals.forEach(function (val) {
		psynth2.triggerAttackRelease(Tone.Frequency(val, "midi"), "4n");
	});
	chordPattern.next();

	steadyPattern.stop();
	steadyPattern.iterations = 4;
	steadyPattern.start();
}

Tone.Transport.bpm.value = 31;
Tone.Transport.start();