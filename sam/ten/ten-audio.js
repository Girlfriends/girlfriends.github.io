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
var chorus = new Tone.Distortion(0.4);
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

var steadyPattern = new Tone.Pattern(function(time, note){
  //the order of the notes passed in depends on the pattern
  psynth.triggerAttackRelease(note, "8n", time, Math.random() * 0.6 + 0.4);
}, ["E5", "G#5", "D#6", "E5", "D#6", "E5", "B5", "G#5", "E5", "G#5", "D#6", "C#6", "D#6", "G#5", "F#5"], "up");
steadyPattern.interval = "8n";
steadyPattern.start("1n");

var steadyPattern2 = new Tone.Pattern(function(time, note){
  //the order of the notes passed in depends on the pattern
  psynth2.triggerAttackRelease(note, 1.5, time);
}, ["E4", "B2", "G#2", "A2", "B2", "A2", "G#2"], "up");
steadyPattern2.interval = 1.5;
steadyPattern2.start("1n");

Tone.Transport.bpm.value = 120;
Tone.Transport.start();